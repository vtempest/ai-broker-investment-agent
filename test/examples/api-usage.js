const axios = require('axios');

/**
 * Example: Using the Stock P/E Calculator REST API
 */

const API_BASE_URL = 'http://localhost:3000';

async function demonstrateAPI() {
    console.log('=== Stock P/E Calculator API Examples ===\n');

    try {
        // Example 1: Get current quote
        console.log('1. Getting current quote for AAPL...');
        const quoteResponse = await axios.get(`${API_BASE_URL}/api/quote/AAPL`);
        console.log(`   Symbol: ${quoteResponse.data.symbol}`);
        console.log(`   Success: ${quoteResponse.data.success}`);
        console.log(`   Data modules: ${Object.keys(quoteResponse.data.data).join(', ')}`);
        console.log();

        // Example 2: Get historical data
        console.log('2. Getting historical data for MSFT (last 3 months, weekly)...');
        const historicalResponse = await axios.get(`${API_BASE_URL}/api/historical/MSFT`, {
            params: {
                period1: '2024-09-01',
                period2: '2024-12-01',
                interval: '1wk'
            }
        });
        console.log(`   Symbol: ${historicalResponse.data.symbol}`);
        console.log(`   Data points: ${historicalResponse.data.dataPoints}`);
        console.log(`   First data point:`, historicalResponse.data.data[0]);
        console.log();

        // Example 3: Calculate P/E ratios
        console.log('3. Calculating P/E ratios for GOOGL (2024, monthly)...');
        const peResponse = await axios.get(`${API_BASE_URL}/api/pe-ratio/GOOGL`, {
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                interval: '1mo'
            }
        });
        console.log(`   Symbol: ${peResponse.data.symbol}`);
        console.log(`   Statistics:`, peResponse.data.statistics);
        console.log(`   Data points: ${peResponse.data.dataPoints}`);
        if (peResponse.data.data.length > 0) {
            console.log(`   Latest P/E:`, peResponse.data.data[peResponse.data.data.length - 1]);
        }
        console.log();

        // Example 4: Health check
        console.log('4. Checking API health...');
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
        console.log(`   Status: ${healthResponse.data.status}`);
        console.log(`   Uptime: ${healthResponse.data.uptime.toFixed(2)} seconds`);
        console.log();

        // Example 5: Error handling
        console.log('5. Demonstrating error handling (invalid symbol)...');
        try {
            await axios.get(`${API_BASE_URL}/api/quote/INVALID123`);
        } catch (error) {
            if (error.response) {
                console.log(`   Error caught: ${error.response.data.error}`);
                console.log(`   Success: ${error.response.data.success}`);
            }
        }
        console.log();

        // Example 6: Custom modules for quote
        console.log('6. Getting specific quote modules...');
        const customQuoteResponse = await axios.get(`${API_BASE_URL}/api/quote/TSLA`, {
            params: {
                modules: 'price,summaryDetail'
            }
        });
        console.log(`   Modules requested: price, summaryDetail`);
        console.log(`   Modules received: ${Object.keys(customQuoteResponse.data.data).join(', ')}`);
        console.log();

        console.log('=== All examples completed successfully! ===');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('\n❌ Error: Could not connect to API server');
            console.error('   Make sure the server is running: npm start');
        } else {
            console.error('\n❌ Error:', error.message);
        }
    }
}

// Run examples
if (require.main === module) {
    console.log('Note: Make sure the API server is running (npm start) before running this example\n');
    demonstrateAPI();
}

module.exports = demonstrateAPI;
