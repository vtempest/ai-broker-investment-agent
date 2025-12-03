import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { portfolios, positions, trades } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create portfolio
    let portfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, session.user.id))
      .limit(1)

    if (portfolio.length === 0) {
      // Create default portfolio
      const newPortfolio = await db
        .insert(portfolios)
        .values({
          id: crypto.randomUUID(),
          userId: session.user.id,
          totalEquity: 100000,
          cash: 100000,
          stocks: 0,
          predictionMarkets: 0,
          margin: 0,
          dailyPnL: 0,
          dailyPnLPercent: 0,
          winRate: 0,
          openPositions: 0,
          updatedAt: new Date(),
        })
        .returning()

      portfolio = newPortfolio
    }

    // Get positions
    const userPositions = await db
      .select()
      .from(positions)
      .where(eq(positions.userId, session.user.id))

    // Get recent trades
    const recentTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, session.user.id))
      .limit(20)

    return NextResponse.json({
      portfolio: portfolio[0],
      positions: userPositions,
      recentTrades,
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const updated = await db
      .update(portfolios)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(portfolios.userId, session.user.id))
      .returning()

    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
