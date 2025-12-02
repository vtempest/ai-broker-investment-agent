const { Downloader } = require('./sec_downloader');
const fs = require('fs');

async function example() {
    const downloader = new Downloader('My Company', 'contact@company.com');
    
    // Get filing metadata
    const metadatas = await downloader.getFilingMetadatas('AAPL/10-K');
    
    // Download a filing
    const html = await downloader.downloadFiling({
        url: metadatas[0].primaryDocUrl
    });

    fs.writeFileSync('filing.html', html);
    
    console.log('Downloaded filing HTML length:', html.length);
}

example();