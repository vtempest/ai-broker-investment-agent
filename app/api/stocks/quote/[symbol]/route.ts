// Stock Quote API Route - Using Finnhub API
import { NextRequest, NextResponse } from 'next/server';
import { finnhub } from '@/lib/stocks/finnhub-wrapper';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;

        // Fetch quote data from Finnhub
        const quoteResult = await finnhub.getQuote({ symbol });

        if (!quoteResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: quoteResult.error || 'Failed to fetch quote',
                    code: 'QUOTE_ERROR',
                    timestamp: new Date().toISOString()
                },
                { status: 500 }
            );
        }

        // Fetch peers/related stocks
        let peers: string[] = [];
        try {
            const peersResult = await finnhub.getPeers(symbol);
            if (peersResult.success && peersResult.peers) {
                peers = peersResult.peers;
            }
        } catch (e) {
            console.warn(`Failed to fetch peers for ${symbol}`, e);
        }

        return NextResponse.json({
            success: true,
            symbol,
            data: { ...quoteResult.data, peers },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch quote',
                code: 'QUOTE_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
