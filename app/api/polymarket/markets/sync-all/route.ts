import { NextRequest, NextResponse } from 'next/server'
import { syncAllMarkets } from '@/packages/investing/src/prediction/polymarket'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const maxMarkets = body.maxMarkets || 1000

    console.log(`Starting sync of all markets (max: ${maxMarkets})...`)
    const result = await syncAllMarkets(maxMarkets)

    return NextResponse.json({
      success: true,
      synced: result.markets,
      message: `Successfully synced ${result.markets} markets`,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Polymarket sync all error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync all markets',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
