/*
# US Stock Symbols

A GitHub Action runs daily to fetch the latest data from offical APIs of NASDAQ, NYSE, and AMEX.

## Output
- **`stock-names.json`**: A JSON array containing tickers and their cleaned names.
  ```json
  [
    ["AAPL", "Apple Inc."],
    ["MSFT", "Microsoft Corporation"],
    ...
  ]
  ```
*/

import fs from 'fs';

const OUTPUT_FILE = 'data/stock-names.json';

// Configuration for output fields
// 'symbol' is the ticker
// 'name' is the company name (will be cleaned)
// Other available fields from API: lastsale, netchange, pctchange, marketCap, country, ipoyear, volume, sector, industry, url
const CONFIG = {
    fields: ['symbol', 'name', 'sector', 'industry', 'marketCap']
};

const SEC_URL = 'https://www.sec.gov/files/company_tickers.json';

const EXCHANGES = ['nasdaq', 'nyse', 'amex'];
const BASE_URL = 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true';

const SUFFIXES = [
    " American Depositary Shares",
    " Depositary Shares",
    " Ordinary Shares",
    " Common Stock",
    " Common Shares",
    " Capital Stock",
    " Units",
    " Warrants",
    " Warrant",
    " Rights",
    " Preferred Stock",
    " Preferred Shares",
    " Depositary Share", // Singular
    " Ordinary Share",   // Singular
    " Common Share"      // Singular
];

const cleanName = (name) => {
    let cleaned = name;
    for (const suffix of SUFFIXES) {
        // Escape special regex chars if any (though our list is simple text)
        // We want to match the suffix and anything after it (.*)
        // Case insensitive match "i" to catch "ordinary share" vs "Ordinary Share"
        const regex = new RegExp(suffix + ".*$", "i");
        if (regex.test(cleaned)) {
            cleaned = cleaned.replace(regex, "");
            break; // Stop after first match to avoid over-cleaning? 
                   // Usually one main asset type per name.
        }
    }
    return cleaned;
};

const formatMarketCap = (cap) => {
    if (!cap) return null;
    // Remove ',' and '$' if present, then parse
    const num = parseFloat(String(cap).replace(/,/g, '').replace(/\$/g, ''));
    if (isNaN(num)) return null;
    // Round to millions
    return Math.round(num / 1000000);
};

async function fetchData(exchange) {
    const url = `${BASE_URL}&exchange=${exchange}`;
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:85.0) Gecko/20100101 Firefox/85.0'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Request failed. Status Code: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(`Error fetching ${exchange}:`, err);
        return null; // Return null on error so Promise.all doesn't reject entirely if we handle it
    }
}

async function main() {
    try {
        console.log('Fetching stock data...');
        
        // Ensure output directory exists
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }

        const results = await Promise.all(EXCHANGES.map(fetchData));

        const allRows = [];
        results.forEach(result => {
             if (result && result.data && result.data.rows) {
                 allRows.push(...result.data.rows);
             }
        });

        console.log(`Fetched ${allRows.length} total rows.`);

        const uniqueTickers = new Map();
        
        allRows.forEach(row => {
            if (row.symbol) {
                const symbol = row.symbol.trim();
                
                // Deduplicate by symbol
                if (!uniqueTickers.has(symbol)) {
                    // Map config fields to values
                    const entry = CONFIG.fields.map(field => {
                        if (field === 'symbol') return symbol;
                        if (field === 'name') return cleanName(row.name ? row.name.trim() : '');
                        if (field === 'marketCap') return formatMarketCap(row.marketCap);
                        return row[field];
                    });
                    uniqueTickers.set(symbol, entry);
                }
            }
        });

        console.log(`Unique tickers after processing: ${uniqueTickers.size}`);
        console.log(`Output fields: ${JSON.stringify(CONFIG.fields)}`);

        // One output as a Map values iterator
        // Convert map values to array and sort by the first field (usually symbol)
        const outputList = Array.from(uniqueTickers.values())
            .sort((a, b) => {
                const valA = String(a[0] || '');
                const valB = String(b[0] || '');
                return valA.localeCompare(valB);
            });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputList));
        console.log(`Successfully wrote to ${OUTPUT_FILE}`);

        // Extract just the symbols for the second output file
        // // const symbolsOnly = outputList.map(entry => entry[0]);
        // // const OUTPUT_FILE_SYMBOLS = 'data/stock-symbols.json';
        // // fs.writeFileSync(OUTPUT_FILE_SYMBOLS, JSON.stringify(symbolsOnly));
        // console.log(`Successfully wrote to ${OUTPUT_FILE_SYMBOLS}`);

        // Generate sector info
        // entry indices based on CONFIG: 0=symbol, 1=name, 2=sector, 3=industry, 4=marketCap
        const sectorInfo = {};
        const overallInfo = {
             sector: "Overall US Public Stocks",
             totalCompanies: 0,
             totalMarketCap: 0,
             industries: {}, 
             companies: []
        };

        outputList.forEach(item => {
            const symbol = item[0];
            const name = item[1];
            const sector = item[2] || 'Unknown';
            // Trim industry name
            const industry = (item[3] || 'Unknown').trim();
            const marketCap = typeof item[4] === 'number' ? item[4] : 0; 

            // Sector aggregation
            if (!sectorInfo[sector]) {
                sectorInfo[sector] = {
                    totalCompanies: 0,
                    totalMarketCap: 0,
                    industries: {}, // Changed to object
                    companies: []
                };
            }
            sectorInfo[sector].totalCompanies++;
            sectorInfo[sector].totalMarketCap += marketCap;
            
            // Sector Industry aggregation
            if (!sectorInfo[sector].industries[industry]) {
                sectorInfo[sector].industries[industry] = {
                    name: industry,
                    totalCompanies: 0,
                    totalMarketCap: 0,
                    symbols: []
                };
            }
            sectorInfo[sector].industries[industry].totalCompanies++;
            sectorInfo[sector].industries[industry].totalMarketCap += marketCap;
            sectorInfo[sector].industries[industry].symbols.push(symbol);

            sectorInfo[sector].companies.push({ symbol, name, marketCap });

            // Overall aggregation
            overallInfo.totalCompanies++;
            overallInfo.totalMarketCap += marketCap;
            
            // Overall Industry aggregation (Keep calculating if we ever need it, but we won't output it for Overall)
            /* 
            if (!overallInfo.industries[industry]) {
                overallInfo.industries[industry] = {
                    name: industry,
                    totalCompanies: 0,
                    totalMarketCap: 0
                };
            }
            overallInfo.industries[industry].totalCompanies++;
            overallInfo.industries[industry].totalMarketCap += marketCap;
            */

            overallInfo.companies.push({ symbol, name, marketCap });
        });

        const processInfo = (info, sectorName, includeIndustries = true) => {
             // Sort companies by market cap desc
            info.companies.sort((a, b) => b.marketCap - a.marketCap);
            
            // Top 10
            const top10 = info.companies.slice(0, 10);

            // Process and sort industries
            let industriesList = [];
            if (includeIndustries) {
                industriesList = Object.values(info.industries)
                    .sort((a, b) => b.totalMarketCap - a.totalMarketCap);
            }

            const result = {
                sector: sectorName,
                totalCompanies: info.totalCompanies,
                totalMarketCap: info.totalMarketCap,
                top10Companies: top10,
            };

            if (includeIndustries) {
                result.industries = industriesList;
            }

            return result;
        };

        const finalSectorOutput = Object.keys(sectorInfo).map(sector => processInfo(sectorInfo[sector], sector, true));

        // Sort sectors by Total Market Cap descending
        finalSectorOutput.sort((a, b) => b.totalMarketCap - a.totalMarketCap);

        // Add Overall entry at the top, without industries
        finalSectorOutput.unshift(processInfo(overallInfo, "Overall US Public Stocks", false));

        const OUTPUT_FILE_SECTORS = 'data/sector-info.json';
        fs.writeFileSync(OUTPUT_FILE_SECTORS, JSON.stringify(finalSectorOutput, null, 2)); // Pretty print for readability
        console.log(`Successfully wrote to ${OUTPUT_FILE_SECTORS}`);

    } catch (err) {
        console.error('An error occurred:', err);
        process.exit(1);
    }
}

main();
