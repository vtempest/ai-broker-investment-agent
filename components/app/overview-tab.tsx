"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, DollarSign, TrendingUp, TrendingDown, Target, Activity } from "lucide-react"

interface PortfolioData {
  portfolio: {
    totalEquity: number
    cash: number
    stocks: number
    predictionMarkets: number
    dailyPnL: number
    dailyPnLPercent: number
    winRate: number
    openPositions: number
  }
  positions: any[]
  recentTrades: any[]
}

export function OverviewTab() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/user/portfolio")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No portfolio data available</p>
      </Card>
    )
  }

  const { portfolio } = data

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Card */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Portfolio Summary</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Equity</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">${portfolio.totalEquity.toLocaleString()}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Daily P&L</span>
              {portfolio.dailyPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className={`text-3xl font-bold ${portfolio.dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.dailyPnL >= 0 ? '+' : ''}${portfolio.dailyPnL.toLocaleString()}
            </div>
            <div className={`text-sm ${portfolio.dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {portfolio.dailyPnLPercent >= 0 ? '+' : ''}{portfolio.dailyPnLPercent.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{portfolio.winRate.toFixed(1)}%</div>
            <Progress value={portfolio.winRate} className="h-2 mt-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Open Positions</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{portfolio.openPositions}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6 pt-6 border-t">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Stocks</div>
            <div className="text-xl font-bold">${portfolio.stocks.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((portfolio.stocks / portfolio.totalEquity) * 100).toFixed(1)}% of portfolio
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Prediction Markets</div>
            <div className="text-xl font-bold">${portfolio.predictionMarkets.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((portfolio.predictionMarkets / portfolio.totalEquity) * 100).toFixed(1)}% of portfolio
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Cash</div>
            <div className="text-xl font-bold">${portfolio.cash.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((portfolio.cash / portfolio.totalEquity) * 100).toFixed(1)}% of portfolio
            </div>
          </div>
        </div>
      </Card>

      {/* Positions */}
      {data.positions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-3">
            {data.positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{position.asset}</div>
                  <div className="text-sm text-muted-foreground">
                    {position.size.toLocaleString()} @ ${position.entryPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toLocaleString()}
                  </div>
                  <div className={`text-sm ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
