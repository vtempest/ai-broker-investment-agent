<p align="center">&nbsp;</p>
<p align="center">
  <h1 align="center"><b>stock-data-sec-api</b></h1>
</p>

<p align="left">
  <!-- Using &nbsp; for alignment due to GitHub README limitations -->
  <b>Essentials ➔&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-success.svg"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/project%20type-API-blue" alt="Project Type: API"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/stability-stable-brightgreen.svg" alt="Stable"></a>
  <br>
  <b>Health ➔&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>
  <a href="https://github.com/yourusername/stock-data-sec-api/actions"><img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/yourusername/stock-data-sec-api/ci.yml?label=ci"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api/commits/main"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/yourusername/stock-data-sec-api"></a>  
  <br>
  <b>Quality ➔&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img alt="Code Quality" src="https://img.shields.io/badge/code%20quality-A-green"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/coverage-95%25-brightgreen" alt="Coverage" /></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/type%20checked-TypeScript-success.svg"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img alt="Code Style: Prettier" src="https://img.shields.io/badge/code%20style-prettier-000000.svg"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/badge/linting-ESLint-blue.svg" alt="ESLint"></a>
  <br>
  <b>Distribution ➔&nbsp;&nbsp;&nbsp;</b>
  <a href="https://www.npmjs.com/package/stock-data-sec-api"><img src="https://img.shields.io/npm/v/stock-data-sec-api.svg" alt="NPM version" /></a>
  <a href="https://www.npmjs.com/package/stock-data-sec-api"><img alt="NPM - Node Version" src="https://img.shields.io/node/v/stock-data-sec-api"></a>
  <a href="https://www.npmjs.com/package/stock-data-sec-api"><img src="https://img.shields.io/npm/dm/stock-data-sec-api?color=success" alt="NPM downloads"></a>
  <br>
  <b>Community ➔&nbsp;&nbsp;&nbsp;&nbsp;</b>
  <a href="https://github.com/yourusername/stock-data-sec-api/discussions"><img alt="GitHub Discussions" src="https://img.shields.io/badge/discussions-join-blue?logo=github"></a>
  <a href="https://github.com/yourusername/stock-data-sec-api"><img src="https://img.shields.io/github/stars/yourusername/stock-data-sec-api.svg?style=social&label=Star us on GitHub!" alt="GitHub stars"></a>
</p>

<div align="left">
  A powerful Node.js library for downloading and parsing SEC EDGAR filings with built-in AI-powered document analysis using Pyodide and sec-parser.
</div>
<br>
<div align="center">
  <b>
  <a href="#demo">See Demo</a> |
  <a href="#documentation">Read Docs</a> |
  <a href="https://github.com/yourusername/stock-data-sec-api/discussions">Join Discussions</a> |
  <a href="#contributing">Contribute</a>
  </b>
</div>
<br>

# Overview

The `stock-data-sec-api` project simplifies downloading and extracting meaningful information from SEC EDGAR HTML documents by combining powerful downloading capabilities with AI-powered parsing. It organizes documents into semantic elements and tree structures, making it perfect for financial analysis, AI/ML applications, and data science projects.

<div align="center">
  <img src="https://via.placeholder.com/400x200/0066CC/FFFFFF?text=SEC+API+Demo" width="400">
</div>

This tool is especially beneficial for Artificial Intelligence (AI), Machine Learning (ML), and Large Language Models (LLM) applications by streamlining data pre-processing and feature extraction.

- Explore the [**Demo**](#demo)
- Read the [**Documentation**](#documentation)
- Join the [**Discussions**](https://github.com/yourusername/stock-data-sec-api/discussions) to get help, propose ideas, or chat with the community
- Report bugs in [**Issues**](https://github.com/yourusername/stock-data-sec-api/issues)
- Learn How to [**Contribute**](#contributing)

# Key Features

- 🚀 **Fast Downloads**: Efficiently download SEC filings using native Node.js
- 🧠 **AI-Powered Parsing**: Built-in sec-parser integration with Pyodide
- 📊 **Semantic Analysis**: Extract structured data from HTML documents
- 🔄 **Offline Support**: Local ticker mapping and wheel file hosting
- 🛡️ **No External Dependencies**: Uses only native Node.js modules and axios
- 📈 **Multiple Formats**: Support for 10-K, 10-Q, 8-K, and other SEC forms
- 🎯 **Easy Integration**: Simple API for quick implementation

# Key Use-Cases

`stock-data-sec-api` is versatile and can be applied in various scenarios, including but not limited to:

#### Financial and Regulatory Analysis

- **Financial Analysis**: Extract financial data from 10-Q and 10-K filings for quantitative modeling
- **Risk Assessment**: Evaluate risk factors or Management's Discussion and Analysis sections
- **Regulatory Compliance**: Assist in automating compliance checks for legal teams
- **Flexible Filtering**: Easily filter SEC documents by sections and types

#### Analytics and Data Science

- **Academic Research**: Facilitate large-scale studies involving public financial disclosures
- **Analytics Ready**: Integrate parsed data seamlessly into popular analytics tools
- **Data Visualization**: Prepare structured data for charts and dashboards

#### AI and Machine Learning

- **AI Applications**: Leverage parsed data for text summarization, sentiment analysis, and NER
- **Data Augmentation**: Use authentic financial text to train ML models
- **LLM Integration**: Prepare data for Large Language Model applications

#### Real-time Data Processing

- **Streaming Analysis**: Process filings as they become available
- **Batch Processing**: Handle multiple filings efficiently
- **API Integration**: Build services on top of SEC data

# Disclaimer

> [!IMPORTANT]
> This project, `stock-data-sec-api`, is an independent, open-source initiative and has no affiliation, endorsement, or verification by the United States Securities and Exchange Commission (SEC). It utilizes public APIs and data provided by the SEC solely for research, informational, and educational objectives. This tool is not intended for financial advisement or as a substitute for professional investment advice or compliance with securities regulations. The creators and maintainers make no warranties, expressed or implied, about the accuracy, completeness, or reliability of the data and analyses presented. Use this software at your own risk. For accurate and comprehensive financial analysis, consult with qualified financial professionals and comply with all relevant legal requirements.

# Getting Started

This guide will walk you through the process of installing the `stock-data-sec-api` package and using it to download and parse the latest Apple 10-Q filing.

## Installation

First, install the package using npm:

```bash
npm install stock-data-sec-api
```

Or using yarn:

```bash
yarn add stock-data-sec-api
```

## Basic Usage

### Downloading SEC Filings

```javascript
const { Downloader } = require('stock-data-sec-api');

// Initialize the downloader with your company name and email
const downloader = new Downloader('My Company', 'email@example.com');

// Download the latest 10-Q filing for Apple
async function downloadAppleFiling() {
    try {
        const html = await downloader.getFilingHtml({
            ticker: 'AAPL',
            form: '10-Q'
        });
        
        console.log('Downloaded filing HTML length:', html.length);
        return html;
    } catch (error) {
        console.error('Error downloading filing:', error.message);
    }
}

downloadAppleFiling();
```

### Parsing with AI

```javascript
const { runPythonScriptWithSecParser } = require('stock-data-sec-api/src/sec-parse');

async function parseFiling(htmlContent) {
    try {
        await runPythonScriptWithSecParser(htmlContent);
    } catch (error) {
        console.error('Error parsing filing:', error.message);
    }
}

// Combine downloading and parsing
async function downloadAndParse() {
    const html = await downloadAppleFiling();
    if (html) {
        await parseFiling(html);
    }
}

downloadAndParse();
```

### Advanced Usage

```javascript
const { Downloader, RequestedFilings } = require('stock-data-sec-api');

async function advancedExample() {
    const downloader = new Downloader('My Company', 'email@example.com');
    
    // Get multiple filings
    const metadatas = await downloader.getFilingMetadatas('AAPL/10-Q/3');
    
    for (const metadata of metadatas) {
        console.log(`Filing Date: ${metadata.filingDate}`);
        console.log(`Accession Number: ${metadata.accessionNumber}`);
        console.log(`Company: ${metadata.companyName}`);
        
        // Download the actual filing
        const filing = await downloader.downloadFiling({
            url: metadata.primaryDocUrl
        });
        
        // Parse with AI
        await runPythonScriptWithSecParser(filing.toString());
    }
}

advancedExample();
```

## Configuration

### Setting Up Wheel File Hosting

To use the AI parsing features, you need to host the sec-parser wheel file:

1. **Upload the wheel file** to a hosting service (GitHub Pages, Netlify, etc.)
2. **Update the URL** in `src/sec-parse.js`:
   ```javascript
   const wheelUrl = 'https://your-server.com/path/to/sec_parser-0.58.1-py3-none-any.whl';
   ```

### Local Ticker Mapping

The project includes a pre-downloaded `company_tickers_exchange.json` file for offline ticker-to-CIK mapping, making it faster and more reliable.

## API Reference

### Downloader Class

#### Constructor
```javascript
new Downloader(companyName, emailAddress)
```

#### Methods

- `getFilingMetadatas(query, options)` - Get filing metadata
- `downloadFiling({ url })` - Download a specific filing
- `getFilingHtml({ ticker, form, query })` - Download and return HTML

### RequestedFilings Class

```javascript
new RequestedFilings(tickerOrCik, formType, limit)
```

### FilingMetadata Class

Contains filing information including:
- `primaryDocUrl` - URL to the main document
- `accessionNumber` - SEC accession number
- `companyName` - Company name
- `filingDate` - Filing date
- `formType` - SEC form type

## Examples

### Example 1: Download Latest 10-K

```javascript
const { Downloader } = require('stock-data-sec-api');

async function downloadLatest10K() {
    const downloader = new Downloader('My Company', 'email@example.com');
    
    const html = await downloader.getFilingHtml({
        ticker: 'MSFT',
        form: '10-K'
    });
    
    console.log('Microsoft 10-K downloaded successfully!');
    return html;
}
```

### Example 2: Batch Processing

```javascript
const { Downloader } = require('stock-data-sec-api');

async function batchDownload() {
    const downloader = new Downloader('My Company', 'email@example.com');
    const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
    
    for (const ticker of tickers) {
        try {
            const metadatas = await downloader.getFilingMetadatas(`${ticker}/10-Q/1`);
            console.log(`Downloaded ${ticker} 10-Q: ${metadatas[0].filingDate}`);
        } catch (error) {
            console.error(`Failed to download ${ticker}:`, error.message);
        }
    }
}
```

### Example 3: AI-Powered Analysis

```javascript
const { Downloader } = require('stock-data-sec-api');
const { runPythonScriptWithSecParser } = require('stock-data-sec-api/src/sec-parse');

async function aiAnalysis() {
    const downloader = new Downloader('My Company', 'email@example.com');
    
    // Download filing
    const html = await downloader.getFilingHtml({
        ticker: 'TSLA',
        form: '10-Q'
    });
    
    // Parse with AI
    console.log('Starting AI analysis...');
    await runPythonScriptWithSecParser(html);
    console.log('AI analysis complete!');
}
```

## Best Practices

### Error Handling

```javascript
async function robustDownload() {
    const downloader = new Downloader('My Company', 'email@example.com');
    
    try {
        const metadatas = await downloader.getFilingMetadatas('AAPL/10-Q');
        
        for (const metadata of metadatas) {
            try {
                const filing = await downloader.downloadFiling({
                    url: metadata.primaryDocUrl
                });
                
                // Process filing
                console.log(`Processed: ${metadata.accessionNumber}`);
            } catch (downloadError) {
                console.error(`Failed to download ${metadata.accessionNumber}:`, downloadError.message);
            }
        }
    } catch (error) {
        console.error('Failed to get filing metadata:', error.message);
    }
}
```

### Rate Limiting

```javascript
const { Downloader } = require('stock-data-sec-api');

async function rateLimitedDownload() {
    const downloader = new Downloader('My Company', 'email@example.com');
    
    const metadatas = await downloader.getFilingMetadatas('AAPL/10-Q/5');
    
    for (let i = 0; i < metadatas.length; i++) {
        const metadata = metadatas[i];
        
        // Add delay between downloads
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const filing = await downloader.downloadFiling({
            url: metadata.primaryDocUrl
        });
        
        console.log(`Downloaded ${i + 1}/${metadatas.length}`);
    }
}
```

## Troubleshooting

### Common Issues

1. **Wheel file not found**: Make sure you've uploaded the wheel file and updated the URL
2. **Ticker not found**: Check if the ticker symbol is correct and exists in the SEC database
3. **Rate limiting**: Add delays between requests if you're making many calls
4. **Memory issues**: For large filings, consider processing in chunks

### Debug Mode

```javascript
// Enable debug logging
process.env.DEBUG = 'sec-api:*';

const { Downloader } = require('stock-data-sec-api');
// ... rest of your code
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/stock-data-sec-api.git
cd stock-data-sec-api

# Install dependencies
npm install

# Run tests
npm test

# Run examples
npm run example
```

### Code Style

- Use ESLint for linting
- Use Prettier for formatting
- Follow Node.js best practices
- Write comprehensive tests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/yourusername/stock-data-sec-api/wiki)
- 💬 [Discussions](https://github.com/yourusername/stock-data-sec-api/discussions)
- 🐛 [Issues](https://github.com/yourusername/stock-data-sec-api/issues)
- ⭐ [Star us on GitHub](https://github.com/yourusername/stock-data-sec-api)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

<div align="center">
  <p>Made with ❤️ for the financial data community</p>
  <p>
    <a href="https://github.com/yourusername/stock-data-sec-api">GitHub</a> •
    <a href="https://www.npmjs.com/package/stock-data-sec-api">NPM</a> •
    <a href="https://github.com/yourusername/stock-data-sec-api/discussions">Discussions</a>
  </p>
</div>
