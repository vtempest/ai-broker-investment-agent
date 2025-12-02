import { Activity, TrendingUp, BarChart3, Globe, Gauge } from "lucide-react"

const indicators = [
  {
    icon: BarChart3,
    name: "PE Ratio",
    weight: "15%",
    description: "Stock valuation relative to earnings. Identifies undervalued or overvalued positions.",
    signals: ["PE < 40 → Bullish", "PE 40-60 → Neutral", "PE > 60 → Bearish"],
  },
  {
    icon: Activity,
    name: "VIX Volatility",
    weight: "20%",
    description: "Market fear/uncertainty index. Adjusts position sizing based on market conditions.",
    signals: ["VIX < 15 → Increase size", "VIX 15-25 → Standard", "VIX > 35 → Reduce exposure"],
  },
  {
    icon: Globe,
    name: "Sector Correlation",
    weight: "15%",
    description: "Performance relative to semiconductor sector. Tracks relative strength and correlation.",
    signals: ["Outperforming → Bullish", "In-line → Neutral", "Underperforming → Bearish"],
  },
  {
    icon: TrendingUp,
    name: "Technical Analysis",
    weight: "30%",
    description: "RSI, MACD, Bollinger Bands, and ATR combined for precise entry and exit timing.",
    signals: ["RSI < 30 → Buy", "MACD Cross → Confirm", "Band Touch → Reversal"],
  },
  {
    icon: Gauge,
    name: "Combined Score",
    weight: "100%",
    description: "Weighted aggregate of all signals producing final trading decision.",
    signals: ["≥0.80 → Strong Buy", "≥0.60 → Buy", "≥0.40 → Hold", "<0.20 → Strong Sell"],
  },
]

export function SignalIndicators() {
  return (
    <section className="border-t border-border bg-secondary/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Signal Scoring System</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our multi-agent system combines fundamental, technical, and sentiment signals into a unified score for
            confident trading decisions.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {indicators.slice(0, 4).map((indicator) => (
            <div
              key={indicator.name}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <indicator.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
                  Weight: {indicator.weight}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{indicator.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{indicator.description}</p>
              <div className="mt-4 space-y-1">
                {indicator.signals.map((signal, idx) => (
                  <p key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {signal}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {/* Combined Score - Full Width */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 md:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                Final Output
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{indicators[4].name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{indicators[4].description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {indicators[4].signals.map((signal, idx) => (
                <p key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {signal}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
