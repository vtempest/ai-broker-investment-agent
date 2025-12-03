import {
  Activity,
  TrendingUp,
  BarChart3,
  Gauge,
  Newspaper,
  UserCheck,
  LineChart,
  CandlestickChart,
  Waves,
  DollarSign,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
    icon: TrendingUp,
    name: "Technical Analysis",
    weight: "30%",
    description: "RSI, MACD, Bollinger Bands, and ATR combined for precise entry and exit timing.",
    signals: ["RSI < 30 → Buy", "MACD Cross → Confirm", "Band Touch → Reversal"],
  },
  {
    icon: Newspaper,
    name: "News Sentiment",
    weight: "20%",
    description: "Real-time news analysis and social sentiment scoring for momentum shifts.",
    signals: ["Score > 0.5 → Bullish", "Score 0-0.5 → Neutral", "Score < 0 → Bearish"],
  },
  {
    icon: Gauge,
    name: "Combined Score",
    weight: "100%",
    description: "Weighted aggregate of all signals producing final trading decision.",
    signals: ["≥0.80 → Strong Buy", "≥0.60 → Buy", "≥0.40 → Hold", "<0.20 → Strong Sell"],
  },
]

const apiDataSources = [
  {
    icon: CandlestickChart,
    name: "Core Stock APIs",
    category: "Price Data",
    endpoints: ["Intraday (1-60 min)", "Daily / Weekly / Monthly", "Quote Endpoint", "Realtime Bulk Quotes"],
    description: "Real-time and historical OHLCV price data for any ticker",
    api: "Alpha Vantage",
  },
  {
    icon: LineChart,
    name: "Technical Indicators",
    category: "Technical",
    endpoints: ["RSI", "MACD", "SMA / EMA", "BBANDS", "STOCH", "ADX", "AROON", "OBV", "VWAP", "ATR"],
    description: "50+ technical indicators for pattern recognition and momentum signals",
    api: "Alpha Vantage",
  },
  {
    icon: Newspaper,
    name: "News & Sentiment",
    category: "Alpha Intelligence",
    endpoints: ["News Sentiment Scores", "Topic Classification", "Ticker Relevance", "Time-Series Sentiment"],
    description: "AI-powered sentiment analysis from news articles and media coverage",
    api: "Alpha Vantage",
  },
  {
    icon: UserCheck,
    name: "Insider Transactions",
    category: "Alpha Intelligence",
    endpoints: ["Executive Trades", "Buy/Sell Signals", "Transaction Values", "Filing Dates"],
    description: "Track insider buying and selling activity for early signals",
    api: "Alpha Vantage",
  },
  {
    icon: DollarSign,
    name: "Fundamental Data",
    category: "Fundamentals",
    endpoints: ["Company Overview", "Income Statement", "Balance Sheet", "Cash Flow", "Earnings"],
    description: "Financial statements, ratios, and company metrics for valuation",
    api: "Alpha Vantage",
  },
  {
    icon: Waves,
    name: "Economic Indicators",
    category: "Macro",
    endpoints: ["Real GDP", "Treasury Yield", "Fed Funds Rate", "CPI / Inflation", "Unemployment"],
    description: "Macroeconomic data for market regime and sector rotation analysis",
    api: "Alpha Vantage",
  },
]

export function SignalIndicators() {
  return (
    <section id="signals" className="border-t border-border bg-secondary/30 px-4 py-24 sm:px-6 lg:px-8">
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

        <div className="mt-24">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Alpha Vantage API Integration
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Core Data Signal Sources</h2>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
              Real-time market data, 50+ technical indicators, AI-powered sentiment analysis, and fundamental metrics
              from Alpha Vantage API for comprehensive signal generation.
            </p>
          </div>

          {/* Data Sources Grid - 6 Core Categories */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {apiDataSources.map((source) => (
              <div
                key={source.name}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <source.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {source.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground">{source.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{source.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {source.endpoints.slice(0, 5).map((endpoint) => (
                    <span
                      key={endpoint}
                      className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {endpoint}
                    </span>
                  ))}
                  {source.endpoints.length > 5 && (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      +{source.endpoints.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* API Provider Badge */}
          <div className="mt-10 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <span className="font-semibold text-foreground">Alpha Vantage</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-500">Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
