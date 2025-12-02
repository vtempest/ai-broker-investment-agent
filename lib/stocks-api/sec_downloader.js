// sec_downloader.js - Node.js version of the Python SEC downloader

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const axios = require('axios');

// Constants (equivalent to _constants.py)
const AMENDS_SUFFIX = '/A';
const CIK_LENGTH = 10;
const SUBMISSION_FILE_FORMAT = 'CIK{cik}.json';
const URL_SUBMISSIONS = 'https://data.sec.gov/submissions/{submission}';

// Regular expression for accession number validation
const accessionNumberRe = /^\d{10}-\d{2}-\d{6}$/;

// Types/Classes
class Ticker {
    constructor(symbol, exchange) {
        this.symbol = symbol;
        this.exchange = exchange;
    }
}

class FilingMetadata {
    constructor({
        primary_doc_url,
        accession_number,
        tickers,
        company_name,
        filing_date,
        report_date,
        primary_doc_description,
        items,
        form_type,
        cik
    }) {
        this.primaryDocUrl = primary_doc_url;
        this.accessionNumber = accession_number;
        this.tickers = tickers;
        this.companyName = company_name;
        this.filingDate = filing_date;
        this.reportDate = report_date;
        this.primaryDocDescription = primary_doc_description;
        this.items = items;
        this.formType = form_type;
        this.cik = cik;
    }
}

class RequestedFilings {
    constructor(ticker_or_cik, form_type, limit = null) {
        this.tickerOrCik = ticker_or_cik;
        this.formType = form_type;
        this.limit = limit;
    }

    static fromString(queryString) {
        const parts = queryString.split('/');
        if (parts.length < 2) {
            throw new Error(`Invalid query string format: ${queryString}`);
        }
        const [tickerOrCik, formType, limitStr] = parts;
        const limit = limitStr ? parseInt(limitStr) : null;
        return new RequestedFilings(tickerOrCik, formType, limit);
    }
}

class CompanyAndAccessionNumber {
    constructor(ticker_or_cik, accession_number) {
        this.tickerOrCik = ticker_or_cik;
        this.accessionNumber = accession_number;
    }

    static fromString(queryString, mustMatch = true) {
        const parts = queryString.split('/');
        if (parts.length === 2) {
            const [tickerOrCik, accessionNumber] = parts;
            if (accessionNumberRe.test(accessionNumber) || accessionNumber.length === 18) {
                return new CompanyAndAccessionNumber(tickerOrCik, accessionNumber);
            }
        }
        if (mustMatch) {
            throw new Error(`Invalid company and accession number format: ${queryString}`);
        }
        return null;
    }
}

class FileContent {
    constructor(path, content) {
        this.path = path;
        this.content = content;
    }
}

// Utility functions
function validateAndConvertTickerOrCik(tickerOrCik, tickerToCikMapping) {
    if (/^\d+$/.test(tickerOrCik)) {
        return tickerOrCik.padStart(CIK_LENGTH, '0');
    }
    
    const cik = tickerToCikMapping[tickerOrCik.toUpperCase()];
    if (!cik) {
        throw new Error(`Could not find CIK for ticker: ${tickerOrCik}`);
    }
    return cik.padStart(CIK_LENGTH, '0');
}

async function getListOfAvailableFilings(submissionsUri, userAgent) {
    try {
        const response = await axios.get(submissionsUri, {
            headers: {
                'User-Agent': userAgent
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch filings from ${submissionsUri}: ${error.message}`);
    }
}

function getToDownload(cik, accessionNumber, primaryDocFilename) {
    const accessionNumberClean = accessionNumber.replace(/-/g, '');
    const primaryDocUri = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumberClean}/${primaryDocFilename}`;
    return { primary_doc_uri: primaryDocUri };
}
async function getTickerToCikMapping(userAgent) {
    // Try to use the local file first
    try {
        return await getTickerToCikMappingFromExchanges(userAgent);
    } catch (localError) {
        console.warn(`Local ticker mapping failed: ${localError.message}`);
        
        // Fallback to the original SEC API
        const url = 'https://www.sec.gov/files/company_tickers.json';
        
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': userAgent
                }
            });
            
            const tickerMapping = {};
            const data = response.data;
            
            // The SEC company_tickers.json format is:
            // {
            //   "0": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple Inc."},
            //   "1": {"cik_str": 789019, "ticker": "MSFT", "title": "Microsoft Corp"},
            //   ...
            // }
            
            for (const key in data) {
                const company = data[key];
                if (company.ticker && company.cik_str) {
                    // Convert CIK to padded string format
                    const cik = String(company.cik_str).padStart(CIK_LENGTH, '0');
                    const ticker = company.ticker.toUpperCase();
                    tickerMapping[ticker] = cik;
                }
            }
            
            return tickerMapping;
            
        } catch (error) {
            console.error(`Failed to fetch ticker to CIK mapping from SEC API: ${error.message}`);
            throw new Error(`Could not load ticker to CIK mapping from any source: ${error.message}`);
        }
    }
}

// Fallback function to get ticker mapping from local exchange-specific data
async function getTickerToCikMappingFromExchanges(userAgent) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
        // Read the local company_tickers_exchange.json file
        const filePath = path.join(__dirname, 'company_tickers_exchange.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        const tickerMapping = {};
        
        // The local file format is an array of arrays:
        // [
        //   [320193, "Apple Inc.", "AAPL", "Nasdaq"],
        //   [789019, "Microsoft Corp", "MSFT", "Nasdaq"],
        //   ...
        // ]
        
        if (Array.isArray(data)) {
            for (const row of data) {
                if (row && row.length >= 3 && row[0] && row[2]) {
                    const cik = String(row[0]).padStart(CIK_LENGTH, '0');
                    const ticker = row[2].toUpperCase();
                    tickerMapping[ticker] = cik;
                }
            }
        }
        
        return tickerMapping;
        
    } catch (error) {
        console.error(`Failed to read local ticker mapping file: ${error.message}`);
        throw new Error(`Could not load local ticker to CIK mapping: ${error.message}`);
    }
}

async function downloadFiling(url, userAgent) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': userAgent
            },
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Failed to download filing from ${url}: ${error.message}`);
    }
}

// Core functions
async function getFilingMetadata({
    tickerOrCik,
    accessionNumber,
    userAgent,
    tickerToCikMapping,
    includeAmends = false
}) {
    let cleanAccessionNumber = accessionNumber;
    if (accessionNumber.length === 18) {
        cleanAccessionNumber = `${accessionNumber.slice(0, 10)}-${accessionNumber.slice(10, 12)}-${accessionNumber.slice(12)}`;
    }
    
    if (!accessionNumberRe.test(cleanAccessionNumber)) {
        throw new Error(`Invalid Accession Number: ${accessionNumber}`);
    }
    
    const cik = validateAndConvertTickerOrCik(tickerOrCik, tickerToCikMapping);
    const result = await getMetadatas({
        cik,
        userAgent,
        limit: 1,
        accessionNumber: cleanAccessionNumber,
        includeAmends
    });
    
    if (result.length === 0) {
        throw new Error(`Could not find filing for ${accessionNumber}`);
    }
    
    return result[0];
}

async function getLatestFilingsMetadata({
    requested,
    userAgent,
    tickerToCikMapping,
    includeAmends = false
}) {
    const cik = validateAndConvertTickerOrCik(requested.tickerOrCik, tickerToCikMapping);
    
    let limit;
    if (requested.limit === null) {
        limit = Number.MAX_SAFE_INTEGER;
    } else {
        limit = parseInt(requested.limit);
        if (limit < 1) {
            throw new Error('Invalid amount. Please enter a number greater than 1.');
        }
    }
    
    const supportedForms = ['10-K', '10-Q', '8-K', '20-F', '6-K', 'DEF 14A', 'S-1', 'S-3', 'S-4', 'S-8'];
    if (!supportedForms.includes(requested.formType)) {
        const formOptions = supportedForms.join(', ');
        throw new Error(
            `'${requested.formType}' forms are not supported. ` +
            `Please choose from the following: ${formOptions}.`
        );
    }
    
    return await getMetadatas({
        cik,
        userAgent,
        limit,
        tickerOrCik: requested.tickerOrCik,
        formType: requested.formType,
        includeAmends
    });
}

async function getMetadatas({
    cik,
    userAgent,
    limit,
    tickerOrCik = null,
    accessionNumber = null,
    formType = null,
    includeAmends = false
}) {
    if (!((tickerOrCik && formType) || accessionNumber)) {
        throw new Error('Either ticker or CIK and form type or accession number must be provided');
    }
    
    const submissionFile = SUBMISSION_FILE_FORMAT.replace('{cik}', cik);
    let submissionsUri = URL_SUBMISSIONS.replace('{submission}', submissionFile);
    
    const additionalSubmissions = [];
    const foundMetadatas = [];
    let fetchedCount = 0;
    let companyTickers = null;
    let companyCik = null;
    let companyName = null;
    
    while (fetchedCount < limit) {
        const respJson = await getListOfAvailableFilings(submissionsUri, userAgent);
        
        let filingsJson;
        if (additionalSubmissions.length === 0 && respJson.filings) {
            // First API response
            filingsJson = respJson.filings.recent;
            if (respJson.filings.files) {
                additionalSubmissions.push(...respJson.filings.files);
            }
            companyTickers = (respJson.tickers || []).map((ticker, i) => 
                new Ticker(ticker, respJson.exchanges?.[i] || '')
            );
            companyName = respJson.name;
            companyCik = String(respJson.cik).padStart(CIK_LENGTH, '0');
        } else {
            // Second page or more
            filingsJson = respJson;
        }
        
        const accessionNumbers = filingsJson.accessionNumber || [];
        const primaryDocumentUrls = filingsJson.primaryDocument || [];
        const filingDates = filingsJson.filingDate || [];
        const reportDates = filingsJson.reportDate || [];
        const primaryDocDescriptions = filingsJson.primaryDocDescription || [];
        const itemsList = filingsJson.items || [];
        const formTypes = filingsJson.form || [];
        
        for (let i = 0; i < accessionNumbers.length; i++) {
            const thisAccessionNumber = accessionNumbers[i];
            const primaryDocFilename = primaryDocumentUrls[i];
            const filingDate = filingDates[i];
            const reportDate = reportDates[i];
            const primaryDocDescription = primaryDocDescriptions[i];
            let thisFormType = formTypes[i];
            const items = itemsList[i];
            
            const isAmend = thisFormType.endsWith(AMENDS_SUFFIX);
            thisFormType = isAmend ? thisFormType.slice(0, -2) : thisFormType;
            
            if (
                (formType && formType !== thisFormType) ||
                (accessionNumber && accessionNumber !== thisAccessionNumber) ||
                (isAmend && !includeAmends)
            ) {
                continue;
            }
            
            const td = getToDownload(cik, thisAccessionNumber, primaryDocFilename);
            const foundMetadata = new FilingMetadata({
                primary_doc_url: td.primary_doc_uri,
                accession_number: thisAccessionNumber,
                tickers: companyTickers,
                company_name: companyName,
                filing_date: filingDate,
                report_date: reportDate,
                primary_doc_description: primaryDocDescription,
                items: items,
                form_type: thisFormType,
                cik: companyCik
            });
            
            foundMetadatas.push(foundMetadata);
            fetchedCount++;
            
            if (fetchedCount === limit) {
                break;
            }
        }
        
        if (additionalSubmissions.length === 0) {
            break;
        }
        
        const nextPage = additionalSubmissions.shift();
        if (nextPage) {
            submissionsUri = URL_SUBMISSIONS.replace('{submission}', nextPage.name);
        } else {
            break;
        }
    }
    
    const requestedForm = formType ? ` of type ${formType}` : '';
    const errorContext = `${accessionNumber || tickerOrCik}${requestedForm}`;
    
    if (foundMetadatas.length === 0) {
        throw new Error(`Could not find any filings: ${errorContext}`);
    }
    
    if (foundMetadatas.length > limit) {
        throw new Error(
            `Found more than ${limit} filings, actual count is ${foundMetadatas.length}: ${errorContext}`
        );
    }
    
    return foundMetadatas;
}

// Main Downloader class
class Downloader {
    constructor(companyName, emailAddress) {
        this.companyName = companyName;
        this.emailAddress = emailAddress;
        this._tickerToCikMapping = null;
        this._initPromise = null;
    }
    
    get userAgent() {
        return `${this.companyName} ${this.emailAddress}`;
    }
    
    async init() {
        if (!this._initPromise) {
            this._initPromise = this._loadTickerToCikMapping();
        }
        return this._initPromise;
    }
    
    async _loadTickerToCikMapping() {
        if (!this._tickerToCikMapping) {
            this._tickerToCikMapping = await getTickerToCikMapping(this.userAgent);
            const mappingCount = Object.keys(this._tickerToCikMapping).length;
            if (mappingCount > 0) {
                const examples = Object.keys(this._tickerToCikMapping).slice(0, 3);
            } else {
                console.warn('Warning: No ticker mappings loaded!');
            }
        }
    }
    
    async getFilingMetadatas(query, { includeAmends = false } = {}) {
        await this.init();
        
        if (typeof query === 'string') {
            const companyAndAccession = CompanyAndAccessionNumber.fromString(query, false);
            if (companyAndAccession) {
                query = companyAndAccession;
            }
        }
        
        if (query instanceof CompanyAndAccessionNumber) {
            return [
                await getFilingMetadata({
                    tickerOrCik: query.tickerOrCik,
                    accessionNumber: query.accessionNumber,
                    userAgent: this.userAgent,
                    tickerToCikMapping: this._tickerToCikMapping,
                    includeAmends
                })
            ];
        }
        
        if (typeof query === 'string') {
            query = RequestedFilings.fromString(query);
        }
        
        if (query instanceof RequestedFilings) {
            return await getLatestFilingsMetadata({
                requested: query,
                userAgent: this.userAgent,
                tickerToCikMapping: this._tickerToCikMapping,
                includeAmends
            });
        }
        
        throw new Error(`Invalid input: ${query}`);
    }
    
    async downloadFiling({ url }) {
        return await downloadFiling(url, this.userAgent);
    }
    
    async getFilingHtml({
        query = null,
        ticker = null,
        form = null
    } = {}) {
        // Syntactic Sugar
        if (query) {
            if (ticker || form) {
                throw new Error('Error: Ticker or form should not be provided when query is specified.');
            }
        }
        
        if (ticker || form) {
            if (query) {
                throw new Error('Error: Query should not be provided when ticker or form is specified.');
            }
            query = `${ticker}/${form}`;
        }
        
        if (!query) {
            throw new Error('Error: Either query or ticker and form must be specified.');
        }
        
        const result = [];
        const metadatas = await this.getFilingMetadatas(query);
        
        for (const metadata of metadatas) {
            const html = await this.downloadFiling({ url: metadata.primaryDocUrl });
            result.push(html);
        }
        
        if (result.length === 0) {
            throw new Error(`Could not find filing for ${query}`);
        }
        
        if (result.length > 1) {
            throw new Error(
                `Found multiple filings for ${query}. Use 'getFilingMetadatas()' and 'downloadFiling()' instead.`
            );
        }
        
        return result[0];
    }
}

// Download Storage class
class DownloadStorage {
    constructor({ filterPattern = null } = {}) {
        this.globPattern = filterPattern || '**/*.*';
        this.tempDir = null;
        this.fileContents = null;
    }
    
    async enter() {
        this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sec-download-'));
        return this.tempDir;
    }
    
    async exit() {
        await this.readFiles();
        if (this.tempDir) {
            await fs.rmdir(this.tempDir, { recursive: true });
        }
    }
    
    async readFiles() {
        this.fileContents = [];
        if (!this.tempDir) {
            throw new Error('Temp dir should be set');
        }
        
        const filepaths = await this._getAllFiles(this.tempDir);
        
        for (const filepath of filepaths) {
            const relativePath = path.relative(this.tempDir, filepath);
            try {
                const content = await fs.readFile(filepath, 'utf-8');
                this.fileContents.push(new FileContent(relativePath, content));
            } catch (error) {
                console.warn(`Could not read file ${filepath}:`, error.message);
            }
        }
    }
    
    async _getAllFiles(dirPath) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    // Recursively get files from subdirectories
                    const subFiles = await this._getAllFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    // Check if file matches the pattern
                    if (this._matchesPattern(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`Could not read directory ${dirPath}:`, error.message);
        }
        
        return files;
    }
    
    _matchesPattern(filename) {
        // Simple pattern matching for common patterns
        // This replaces the glob functionality with basic pattern matching
        if (this.globPattern === '**/*.*') {
            // Match all files with extensions
            return filename.includes('.');
        } else if (this.globPattern === '**/*') {
            // Match all files
            return true;
        } else if (this.globPattern.includes('*')) {
            // Basic wildcard matching
            const pattern = this.globPattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(filename);
        } else {
            // Exact match
            return filename === this.globPattern;
        }
    }
    
    getFileContents() {
        if (this.fileContents === null) {
            throw new Error('File contents are not available until the context is exited.');
        }
        return this.fileContents;
    }
}

// Export classes and functions
module.exports = {
    Downloader,
    DownloadStorage,
    FilingMetadata,
    RequestedFilings,
    CompanyAndAccessionNumber,
    Ticker,
    FileContent,
    getFilingMetadata,
    getLatestFilingsMetadata,
    downloadFiling
};