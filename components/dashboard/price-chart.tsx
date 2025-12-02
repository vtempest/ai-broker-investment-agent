"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useState } from "react"

const data = [
  { date: "Nov 1", price: 142.5, predicted: null },
  { date: "Nov 4", price: 145.2, predicted: null },
  { date: "Nov 5", price: 143.8, predicted: null },
  { date: "Nov 6", price: 148.1, predicted: null },
  { date: "Nov 7", price: 151.3, predicted: null },
  { date: "Nov 8", price: 149.7, predicted: null },
  { date: "Nov 11", price: 152.4, predicted: null },
  { date: "Nov 12", price: 155.1, predicted: null },
  { date: "Nov 13", price: 153.8, predicted: null },
  { date: "Nov 14", price: 157.2, predicted: null },
  { date: "Nov 15", price: 159.5, predicted: null },
  { date: "Nov 18", price: 161.3, predicted: null },
  { date: "Nov 19", price: 158.9, predicted: null },
  { date: "Nov 20", price: 162.4, predicted: null },
  { date: "Nov 21", price: 165.1, predicted: null },
  { date: "Nov 22", price: 163.8, predicted: null },
  { date: "Nov 25", price: 166.2, predicted: 166.2 },
  { date: "Nov 26", price: null, predicted: 168.5 },
]

const timeframes = ["1D", "1W", "1M", "3M", "1Y"]

export function PriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M")

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg text-card-foreground">AAPL Price Analysis</CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold text-card-foreground">$166.20</span>
            <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
              +2.38%
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf)}
              className="h-8 px-3 text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.72 0.19 155)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 80)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.15 80)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.01 260)",
                  border: "1px solid oklch(0.28 0.01 260)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
                labelStyle={{ color: "oklch(0.65 0 0)" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.72 0.19 155)"
                strokeWidth={2}
                fill="url(#priceGradient)"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="oklch(0.75 0.15 80)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#predictedGradient)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Actual Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-muted-foreground">Predicted (Next Day)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
