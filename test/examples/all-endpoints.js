const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoint(name, url) {
    try {
        console.log(`\nTesting ${name}...`);
        const response = await axios.get(url);

        if (response.data.success) {
            console.log(`✅ Success!`);
            if (response.data.count !== undefined) {
                console.log(`   Count: ${response.data.count}`);
            }
            // Log a small sample of data
            const data = response.data.data;
            if (Array.isArray(data) && data.length > 0) {
                console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
            } else if (typeof data === 'object') {
                console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
            }
        } else {
            console.log(`❌ Failed: API returned success=false`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

async function runTests() {
    console.log('🚀 Starting API Endpoint Tests\n');

    // 1. Market Discovery
    await testEndpoint('Search (Apple)', `${BASE_URL}/search?q=apple`);
    await testEndpoint('Trending (US)', `${BASE_URL}/trending?region=US`);
    await testEndpoint('Daily Gainers', `${BASE_URL}/gainers?region=US`);
    await testEndpoint('Screener (Day Gainers)', `${BASE_URL}/screener?scrIds=day_gainers`);

    // 2. Stock Analysis
    const symbol = 'AAPL';
    await testEndpoint(`Recommendations (${symbol})`, `${BASE_URL}/recommendations/${symbol}`);
    await testEndpoint(`Insights (${symbol})`, `${BASE_URL}/insights/${symbol}`);
    await testEndpoint(`Options Chain (${symbol})`, `${BASE_URL}/options/${symbol}`);
    await testEndpoint(`Advanced Chart (${symbol})`, `${BASE_URL}/chart/${symbol}?range=1mo&interval=1d`);

    // 3. Fundamentals
    const today = new Date().toISOString().split('T')[0];
    const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await testEndpoint(`Fundamentals (${symbol})`, `${BASE_URL}/fundamentals/${symbol}?period1=${lastYear}&type=quarterly`);

    console.log('\n✨ All tests completed!');
}

runTests();
