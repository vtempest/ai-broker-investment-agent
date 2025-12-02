"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"

const analyses = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    time: "10 min ago",
    prediction: "+1.8%",
    direction: "up",
    confidence: 87,
    status: "complete",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    time: "25 min ago",
    prediction: "+0.9%",
    direction: "up",
    confidence: 79,
    status: "complete",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    time: "42 min ago",
    prediction: "-0.5%",
    direction: "down",
    confidence: 72,
    status: "complete",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    time: "1 hr ago",
    prediction: "+2.3%",
    direction: "up",
    confidence: 84,
    status: "complete",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    time: "1.5 hr ago",
    prediction: "+1.1%",
    direction: "up",
    confidence: 76,
    status: "complete",
  },
]

export function RecentAnalysis() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-card-foreground">Recent Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Prediction</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Confidence</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <tr key={analysis.symbol} className="border-b border-border/50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-mono text-sm font-semibold text-card-foreground">
                        {analysis.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">{analysis.symbol}</div>
                        <div className="text-xs text-muted-foreground">{analysis.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div
                      className={`flex items-center gap-1 font-medium ${
                        analysis.direction === "up" ? "text-chart-1" : "text-chart-4"
                      }`}
                    >
                      {analysis.direction === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {analysis.prediction}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${analysis.confidence}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{analysis.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {analysis.time}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                      Complete
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
