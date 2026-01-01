// Historical Stock Data API Route
import { NextRequest, NextResponse } from 'next/server';
import { FinnhubWrapper } from '@/lib/stocks/finnhub-wrapper';

const finnhub = new FinnhubWrapper();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    let symbol = '';
    try {
        const paramsValue = await params;
        symbol = paramsValue.symbol;
        const { searchParams } = new URL(request.url);

        // Get parameters with defaults
        const interval = searchParams.get('interval') || '1d';
        const range = searchParams.get('range') || '1mo'; // default to 1 month
        
        // Allow either period1/period2 OR range
        const period1Param = searchParams.get('period1');
        const period2Param = searchParams.get('period2');

        let queryOptions: any = {
            interval: interval as any
        };

        // If period1 and period2 are provided, use them
        if (period1Param && period2Param) {
            queryOptions.period1 = period1Param;
            queryOptions.period2 = period2Param;
        } else {
            // Calculate start date based on range
            const now = new Date();
            let startDate = new Date();
            
            switch(range) {
                case '1d':
                    startDate.setDate(now.getDate() - 1);
                    break;
                case '5d':
                    startDate.setDate(now.getDate() - 5);
                    break;
                case '1mo':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case '3mo':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
                case '6mo':
                    startDate.setMonth(now.getMonth() - 6);
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                case '2y':
                    startDate.setFullYear(now.getFullYear() - 2);
                    break;
                case '5y':
                    startDate.setFullYear(now.getFullYear() - 5);
                    break;
                case '10y':
                    startDate.setFullYear(now.getFullYear() - 10);
                    break;
                case 'ytd':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                case 'max':
                    startDate = new Date(1970, 0, 1);
                    break;
                default:
                    // Default to 1 month if invalid range
                    startDate.setMonth(now.getMonth() - 1);
            }
            
            queryOptions.period1 = startDate;
        }

        console.log(`Fetching historical data for ${symbol} with options:`, queryOptions);

        // Calculate end date (period2) if not provided
        const endDate = queryOptions.period2 || new Date();

        const result = await finnhub.getHistoricalData({
            symbol,
            period1: queryOptions.period1,
            period2: endDate,
            interval: interval as any
        });

        if (!result.success || !result.data?.quotes || result.data.quotes.length === 0) {
            const errorMessage = !result.success
                ? (result as any).error || 'Failed to fetch historical data'
                : `No historical data found for ${symbol}`;

            console.log(`Historical data API response: ${JSON.stringify({
                success: result.success,
                quotesLength: result.data?.quotes?.length || 0,
                error: (result as any).error,
                source: (result as any).source
            })}`);

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    code: 'NO_DATA',
                    source: (result as any).source,
                    hint: !process.env.ALPACA_API_KEY && !process.env.FINNHUB_API_KEY
                        ? 'No API keys configured. Set FINNHUB_API_KEY and/or ALPACA_API_KEY + ALPACA_SECRET environment variables.'
                        : undefined,
                    timestamp: new Date().toISOString()
                },
                { status: 404 }
            );
        }

        const quotes = result.data.quotes;
        const meta = result.data.meta;

        return NextResponse.json({
            success: true,
            symbol,
            source: (result as any).source || 'unknown',
            period: {
                start: quotes[0]?.date || period1Param || range,
                end: quotes[quotes.length - 1]?.date || period2Param || 'now'
            },
            interval,
            dataPoints: quotes.length,
            data: quotes,
            meta: {
                currency: meta?.currency,
                symbol: meta?.symbol,
                exchangeName: meta?.exchangeName,
                instrumentType: meta?.instrumentType,
                firstTradeDate: meta?.firstTradeDate,
                regularMarketTime: meta?.regularMarketTime,
                regularMarketPrice: meta?.regularMarketPrice,
                gmtoffset: meta?.gmtoffset,
                timezone: meta?.timezone,
                exchangeTimezoneName: meta?.exchangeTimezoneName
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Historical data fetch error:', error);
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to fetch historical data';
        let errorCode = 'HISTORICAL_ERROR';

        if (error.message?.includes('Invalid symbol')) {
            errorMessage = `Invalid symbol: ${symbol}`;
            errorCode = 'INVALID_SYMBOL';
        } else if (error.message?.includes('Not Found')) {
            errorMessage = `Symbol not found: ${symbol}`;
            errorCode = 'SYMBOL_NOT_FOUND';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                code: errorCode,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
