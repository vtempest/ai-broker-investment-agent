// server.js - Unified Hono server for SEC Filing Downloader and Yahoo Finance API

const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');
const { serve } = require('@hono/node-server');
const { Downloader } = require('./sec_downloader');
const yahooFinance = require('yahoo-finance2').default;
const HistoricalPECalculator = require('./pe');
const fs = require('fs').promises;
const YAML = require('yamljs');
const path = require('path');

// Initialize Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Initialize SEC downloader
const downloader = new Downloader('SEC API Server', 'api@example.com');

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

// Helper function for error response
const errorResponse = (c, error, code = 'INTERNAL_ERROR', status = 500) => {
  console.error(`Error in ${c.req.path}:`, error);
  return c.json({
    success: false,
    error: error.message || 'Internal server error',
    code,
    timestamp: new Date().toISOString()
  }, status);
};

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      sec: 'active',
      yahoo: 'active'
    }
  });
});

// ==========================================
// SEC Endpoints
// ==========================================

// Get filing metadata
app.get('/filings/metadata', async (c) => {
  try {
    const query = c.req.query('query');
    const includeAmends = c.req.query('includeAmends') === 'true';

    if (!query) {
      return errorResponse(c, new Error('Query parameter is required'), 'MISSING_QUERY', 400);
    }

    const metadatas = await downloader.getFilingMetadatas(query, { includeAmends });

    return c.json(metadatas);
  } catch (error) {
    return errorResponse(c, error, 'METADATA_ERROR');
  }
});

// Download filing content
app.get('/filings/download', async (c) => {
  try {
    const url = c.req.query('url');

    if (!url) {
      return errorResponse(c, new Error('URL parameter is required'), 'MISSING_URL', 400);
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return errorResponse(c, new Error('Invalid URL format'), 'INVALID_URL', 400);
    }

    const content = await downloader.downloadFiling({ url });

    // Determine content type based on URL
    let contentType = 'application/octet-stream';
    if (url.endsWith('.htm') || url.endsWith('.html')) {
      contentType = 'text/html';
    } else if (url.endsWith('.xml')) {
      contentType = 'application/xml';
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${url.split('/').pop()}"`
      }
    });
  } catch (error) {
    return errorResponse(c, error, 'DOWNLOAD_ERROR');
  }
});

// Get filing HTML content
app.get('/filings/html', async (c) => {
  try {
    const ticker = c.req.query('ticker');
    const form = c.req.query('form');
    const query = c.req.query('query');

    let finalQuery = query;
    if (ticker && form) {
      finalQuery = `${ticker}/${form}`;
    }

    if (!finalQuery) {
      return errorResponse(c, new Error('Either query parameter or both ticker and form parameters are required'), 'MISSING_PARAMETERS', 400);
    }

    const html = await downloader.getFilingHtml({ query: finalQuery });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (error) {
    return errorResponse(c, error, 'HTML_ERROR');
  }
});

// Get ticker to CIK mapping
app.get('/companies/ticker-mapping', async (c) => {
  try {
    await downloader.init();
    const mapping = downloader._tickerToCikMapping;

    return c.json(mapping);
  } catch (error) {
    return errorResponse(c, error, 'MAPPING_ERROR');
  }
});

// Get company filings
app.get('/companies/:tickerOrCik/filings', async (c) => {
  try {
    const tickerOrCik = c.req.param('tickerOrCik');
    const formType = c.req.query('formType');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 10;
    const includeAmends = c.req.query('includeAmends') === 'true';

    if (!tickerOrCik) {
      return errorResponse(c, new Error('Ticker or CIK parameter is required'), 'MISSING_TICKER_OR_CIK', 400);
    }

    let query = tickerOrCik;
    if (formType) {
      query = `${tickerOrCik}/${formType}`;
    }

    const metadatas = await downloader.getFilingMetadatas(query, { includeAmends });

    // Apply limit
    const limitedMetadatas = metadatas.slice(0, limit);

    return c.json(limitedMetadatas);
  } catch (error) {
    return errorResponse(c, error, 'COMPANY_FILINGS_ERROR');
  }
});

// ==========================================
// Yahoo Finance Endpoints
// ==========================================

// Get Stock Quote
app.get('/api/quote/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const modules = c.req.query('modules') ? c.req.query('modules').split(',') : ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData'];

    const result = await yahooFinance.quoteSummary(symbol, { modules });

    return c.json({
      success: true,
      symbol,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'QUOTE_ERROR');
  }
});

// Get Historical Price Data
app.get('/api/historical/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const period1 = c.req.query('period1');
    const period2 = c.req.query('period2');
    const interval = c.req.query('interval') || '1d';

    if (!period1 || !period2) {
      return errorResponse(c, new Error('period1 and period2 are required'), 'MISSING_PERIOD', 400);
    }

    const queryOptions = { period1, period2, interval };
    const result = await yahooFinance.chart(symbol, queryOptions);

    return c.json({
      success: true,
      symbol,
      period: { start: period1, end: period2 },
      interval,
      dataPoints: result.quotes ? result.quotes.length : 0,
      data: result.quotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'HISTORICAL_ERROR');
  }
});

// Calculate Historical P/E Ratios
app.get('/api/pe-ratio/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const interval = c.req.query('interval') || '1mo';

    if (!startDate || !endDate) {
      return errorResponse(c, new Error('startDate and endDate are required'), 'MISSING_DATE', 400);
    }

    const calculator = new HistoricalPECalculator();
    // Suppress notices
    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

    const result = await calculator.calculateHistoricalPEForStock(symbol, startDate, endDate, interval);

    return c.json({
      success: true,
      symbol,
      period: { start: startDate, end: endDate },
      interval,
      statistics: result.statistics,
      dataPoints: result.peRatios.length,
      data: result.peRatios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'PE_RATIO_ERROR');
  }
});

// Search for Symbols
app.get('/api/search', async (c) => {
  try {
    const query = c.req.query('q');
    if (!query) {
      return errorResponse(c, new Error('Query parameter q is required'), 'MISSING_QUERY', 400);
    }

    const result = await yahooFinance.search(query);

    return c.json({
      success: true,
      count: result.count,
      data: result.quotes,
      news: result.news,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'SEARCH_ERROR');
  }
});

// Get Trending Symbols
app.get('/api/trending', async (c) => {
  try {
    const region = c.req.query('region') || 'US';
    const result = await yahooFinance.trending(region);

    return c.json({
      success: true,
      data: result.quotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'TRENDING_ERROR');
  }
});

// Get Daily Gainers
app.get('/api/gainers', async (c) => {
  try {
    const region = c.req.query('region') || 'US';
    const lang = c.req.query('lang') || 'en-US';
    const result = await yahooFinance.dailyGainers({ region, lang });

    return c.json({
      success: true,
      count: result.quotes ? result.quotes.length : 0,
      data: result.quotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'GAINERS_ERROR');
  }
});

// Stock Screener
app.get('/api/screener', async (c) => {
  try {
    const scrIds = c.req.query('scrIds');
    if (!scrIds) {
      return errorResponse(c, new Error('scrIds parameter is required'), 'MISSING_SCRIDS', 400);
    }

    const result = await yahooFinance.screener({ scrIds });

    return c.json({
      success: true,
      count: result.quotes ? result.quotes.length : 0,
      data: result.quotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'SCREENER_ERROR');
  }
});

// Get Recommendations
app.get('/api/recommendations/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const result = await yahooFinance.recommendationsBySymbol(symbol);

    return c.json({
      success: true,
      count: result.recommendedTrend ? result.recommendedTrend.length : 0,
      data: result.recommendedTrend,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'RECOMMENDATIONS_ERROR');
  }
});

// Get Insights
app.get('/api/insights/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const result = await yahooFinance.insights(symbol, { lang: 'en-US', reportsCount: 5, region: 'US' });

    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'INSIGHTS_ERROR');
  }
});

// Get Options Chain
app.get('/api/options/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const date = c.req.query('date');

    const queryOptions = {};
    if (date) queryOptions.date = date;

    const result = await yahooFinance.options(symbol, queryOptions);

    return c.json({
      success: true,
      expirationDate: result.expirationDates,
      strikes: result.strikes,
      options: result.options,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'OPTIONS_ERROR');
  }
});

// Get Advanced Chart
app.get('/api/chart/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const interval = c.req.query('interval') || '1d';
    const range = c.req.query('range') || '1mo';

    const result = await yahooFinance.chart(symbol, { interval, range });

    return c.json({
      success: true,
      meta: result.meta,
      quotes: result.quotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'CHART_ERROR');
  }
});

// Get Fundamentals
app.get('/api/fundamentals/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const period1 = c.req.query('period1');
    const period2 = c.req.query('period2');
    const type = c.req.query('type') || 'quarterly'; // quarterly, annual, trailing
    const moduleName = c.req.query('module') || 'all'; // financials, balance-sheet, cash-flow, all

    if (!period1) {
      return errorResponse(c, new Error('period1 is required'), 'MISSING_PERIOD', 400);
    }

    // This is a bit more complex as yahoo-finance2 doesn't have a direct "fundamentals time series" endpoint
    // We'll use quoteSummary with relevant modules
    const modules = [
      'incomeStatementHistory', 'incomeStatementHistoryQuarterly',
      'balanceSheetHistory', 'balanceSheetHistoryQuarterly',
      'cashflowStatementHistory', 'cashflowStatementHistoryQuarterly',
      'earnings'
    ];

    const result = await yahooFinance.quoteSummary(symbol, { modules });

    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return errorResponse(c, error, 'FUNDAMENTALS_ERROR');
  }
});

// ==========================================
// System Endpoints
// ==========================================

// Serve OpenAPI specification (YAML)
app.get('/openapi.yaml', async (c) => {
  try {
    const openApiSpec = await fs.readFile(path.join(__dirname, 'openapi.yaml'), 'utf-8');
    return new Response(openApiSpec, {
      headers: {
        'Content-Type': 'application/x-yaml'
      }
    });
  } catch (error) {
    return errorResponse(c, new Error('OpenAPI specification not found'), 'OPENAPI_NOT_FOUND', 404);
  }
});

// Serve OpenAPI specification (JSON)
app.get('/openapi.json', async (c) => {
  try {
    const yamlContent = await fs.readFile(path.join(__dirname, 'openapi.yaml'), 'utf-8');
    const jsonSpec = YAML.parse(yamlContent);
    return c.json(jsonSpec);
  } catch (error) {
    return errorResponse(c, new Error('OpenAPI specification not found'), 'OPENAPI_NOT_FOUND', 404);
  }
});

// Swagger UI endpoint
app.get('/api-docs', async (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - Unified Stock & SEC API</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>
  `;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  });
});

// Serve API documentation (basic HTML)
app.get('/docs', (c) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Unified Stock & SEC API</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        header { background-color: #2c3e50; color: white; padding: 20px 0; margin-bottom: 40px; }
        header .container { padding-top: 0; padding-bottom: 0; display: flex; justify-content: space-between; align-items: center; }
        h1 { margin: 0; font-size: 24px; }
        .badge { background: #3498db; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .section { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 30px; margin-bottom: 30px; }
        h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0; color: #2c3e50; }
        .endpoint-group { margin-bottom: 20px; }
        .endpoint { display: flex; align-items: center; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #ddd; transition: transform 0.2s; }
        .endpoint:hover { transform: translateX(5px); background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .method { font-weight: bold; min-width: 60px; }
        .method.GET { color: #27ae60; }
        .path { font-family: monospace; font-size: 14px; color: #e83e8c; margin-right: 15px; font-weight: bold; }
        .desc { color: #666; font-size: 14px; flex-grow: 1; }
        .links a { color: #3498db; text-decoration: none; margin-left: 15px; font-size: 14px; }
        .links a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Unified Stock & SEC API</h1>
            <span class="badge">v1.0.0</span>
        </div>
    </header>
    
    <div class="container">
        <div class="section">
            <h2>Overview</h2>
            <p>This API unifies SEC EDGAR filing data with Yahoo Finance market data. It provides endpoints for retrieving stock quotes, historical prices, P/E ratios, and official SEC filings.</p>
            <p>
                <a href="/api-docs" target="_blank">📖 Swagger UI</a> |
                <a href="/openapi.yaml" target="_blank">📄 OpenAPI Spec (YAML)</a> |
                <a href="/openapi.json" target="_blank">📄 OpenAPI Spec (JSON)</a> |
                <a href="/health" target="_blank">💓 Health Check</a>
            </p>
        </div>

        <div class="section">
            <h2>SEC Filings</h2>
            <div class="endpoint-group">
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/filings/metadata</span>
                    <span class="desc">Get filing metadata</span>
                    <span class="links"><a href="/filings/metadata?query=AAPL/10-K" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/filings/download</span>
                    <span class="desc">Download filing content</span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/filings/html</span>
                    <span class="desc">Get filing HTML</span>
                    <span class="links"><a href="/filings/html?ticker=AAPL&form=10-K" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/companies/ticker-mapping</span>
                    <span class="desc">Get ticker to CIK mapping</span>
                    <span class="links"><a href="/companies/ticker-mapping" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/companies/:ticker/filings</span>
                    <span class="desc">Get company filings</span>
                    <span class="links"><a href="/companies/AAPL/filings?limit=5" target="_blank">Try it</a></span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Market Data (Yahoo Finance)</h2>
            <div class="endpoint-group">
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/quote/:symbol</span>
                    <span class="desc">Get stock quote</span>
                    <span class="links"><a href="/api/quote/AAPL" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/historical/:symbol</span>
                    <span class="desc">Get historical prices</span>
                    <span class="links"><a href="/api/historical/AAPL?period1=2024-01-01&period2=2024-01-31" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/pe-ratio/:symbol</span>
                    <span class="desc">Calculate historical P/E</span>
                    <span class="links"><a href="/api/pe-ratio/AAPL?startDate=2023-01-01&endDate=2023-12-31" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/search</span>
                    <span class="desc">Search symbols</span>
                    <span class="links"><a href="/api/search?q=apple" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/trending</span>
                    <span class="desc">Get trending symbols</span>
                    <span class="links"><a href="/api/trending" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/gainers</span>
                    <span class="desc">Get daily gainers</span>
                    <span class="links"><a href="/api/gainers" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/recommendations/:symbol</span>
                    <span class="desc">Get analyst recommendations</span>
                    <span class="links"><a href="/api/recommendations/AAPL" target="_blank">Try it</a></span>
                </div>
                <div class="endpoint">
                    <span class="method GET">GET</span>
                    <span class="path">/api/chart/:symbol</span>
                    <span class="desc">Get advanced chart data</span>
                    <span class="links"><a href="/api/chart/AAPL?range=1mo&interval=1d" target="_blank">Try it</a></span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  }, 500);
});

// Start server
const port = process.env.PORT || 3000;

console.log(`Starting Unified Stock & SEC API server on port ${port}...`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`);
  console.log(`📖 Swagger UI: http://localhost:${info.port}/api-docs`);
  console.log(`📚 API Documentation: http://localhost:${info.port}/docs`);
  console.log(`📋 OpenAPI Spec: http://localhost:${info.port}/openapi.yaml`);
});

module.exports = app;
