const HistoricalPECalculator = require('../pe');
const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const path = require('path');

/**
 * CSV export example - Export P/E data to CSV files
 */
async function exportToCSV() {
    console.log('=== CSV Export Example ===\n');

    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

    const calculator = new HistoricalPECalculator();
    const symbol = 'TSLA';

    try {
        console.log(`Calculating P/E ratios for ${symbol}...`);

        await calculator.calculateHistoricalPEForStock(
            symbol,
            '2022-01-01',
            '2024-12-31',
            '1wk'  // Weekly data for more detail
        );

        // Generate CSV data
        const csvData = calculator.exportToCSV();

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Save to file
        const filename = `${symbol}_historical_pe.csv`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, csvData);

        console.log(`\n✓ Data exported to: ${filepath}`);

        // Display file info
        const stats = fs.statSync(filepath);
        const lines = csvData.split('\n').length - 1;

        console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`  Data rows: ${lines}`);

        // Show preview of CSV
        console.log('\n=== CSV Preview (first 10 lines) ===');
        console.log(csvData.split('\n').slice(0, 11).join('\n'));

        // Display statistics
        const peStats = calculator.getPEStatistics();
        if (peStats) {
            console.log('\n=== Summary Statistics ===');
            console.log(`Valid data points: ${peStats.count}`);
            console.log(`Average P/E: ${peStats.average.toFixed(2)}`);
            console.log(`Median P/E: ${peStats.median.toFixed(2)}`);
            console.log(`Range: ${peStats.min.toFixed(2)} - ${peStats.max.toFixed(2)}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the example
if (require.main === module) {
    exportToCSV();
}

module.exports = exportToCSV;
