const { parseSECFilingToJson } = require('../src/sec-parse');

const fs = require('fs').promises;
    
const htmlContent = await fs.readFile('test/filing.html', 'utf-8');
    
await parseSECFilingToJson(htmlContent);