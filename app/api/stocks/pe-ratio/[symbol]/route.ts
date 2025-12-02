// P/E Ratio Calculation API Route
import { NextRequest, NextResponse } from 'next/server';
import { HistoricalPECalculator } from '@/lib/stocks/pe-calculator';
import yahooFinance from 'yahoo-finance2';

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;
        const { searchParams } = new URL(request.url);

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const interval = (searchParams.get('interval') || '1mo') as '1d' | '1wk' | '1mo';

        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'startDate and endDate parameters are required',
                    code: 'MISSING_PARAMS',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }

        const calculator = new HistoricalPECalculator();
        const result = await calculator.calculateHistoricalPEForStock(
            symbol,
            startDate,
            endDate,
            interval
        );

        return NextResponse.json({
            success: true,
            symbol,
            period: {
                start: startDate,
                end: endDate
            },
            interval,
            statistics: result.statistics,
            dataPoints: result.peRatios.length,
            data: result.peRatios.map(item => ({
                date: item.date.toISOString().split('T')[0],
                price: item.price,
                ttmEPS: item.ttmEPS,
                peRatio: item.peRatio
            })),
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to calculate P/E ratios',
                code: 'PE_RATIO_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
