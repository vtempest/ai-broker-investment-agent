// Historical Price Data API Route
import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;
        const { searchParams } = new URL(request.url);

        const period1 = searchParams.get('period1');
        const period2 = searchParams.get('period2');
        const interval = searchParams.get('interval') || '1d';

        if (!period1 || !period2) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'period1 and period2 parameters are required',
                    code: 'MISSING_PARAMS',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }

        const result = await yahooFinance.chart(symbol, {
            period1,
            period2,
            interval: interval as any
        });

        return NextResponse.json({
            success: true,
            symbol,
            period: {
                start: period1,
                end: period2
            },
            interval,
            dataPoints: result.quotes?.length || 0,
            data: result.quotes,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch historical data',
                code: 'HISTORICAL_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
