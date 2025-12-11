"use client"

import { useState } from "react"
import { TrendingUp, ArrowLeftRight, Zap, Timer, ChevronRight, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const strategies = [
  {
    id: "momentum",
    name: "Momentum Trading",
    type: "Trend Following",
    icon: TrendingUp,
    timeframe: "Daily",
    winRate: "50-60%",
    riskLevel: "Moderate",
    bestMarket: "Trending",
    color: "emerald",
    description: "Stocks in motion tend to stay in motion. Buy when momentum is building, sell when it's fading.",
    philosophy: "The trend is your friend",
    entryConditions: [
      "RSI recovery (crosses above 30)",
      "MACD crossover (bullish signal)",
      "Volume surge (>1.5x average)",
      "Strong trend confirmed (ADX > 25)",
    ],
    exitConditions: [
      "Overbought conditions (RSI > 70)",
      "MACD reversal (bearish crossover)",
      "Stop-loss triggers (-2%)",
      "Take-profit targets (+4%)",
    ],
    bestFor: ["Strong trending markets", "Sector strength"],
    avoid: ["Choppy markets", "Unclear trend"],
  },
  {
    id: "meanreversion",
    name: "Mean Reversion",
    type: "Statistical",
    icon: ArrowLeftRight,
    timeframe: "Daily",
    winRate: "55-65%",
    riskLevel: "Moderate",
    bestMarket: "Range-bound",
    color: "blue",
    description: "Prices tend to revert to their statistical mean. Buy extreme lows, sell extreme highs.",
    philosophy: "What goes up must come down",
    entryConditions: [
      "Lower Bollinger Band touch",
      "Severe oversold (RSI < 25)",
      "Z-score deviation (<-2 standard deviations)",
    ],
    exitConditions: [
      "Middle Bollinger Band cross",
      "RSI normalization (>50)",
      "Profit targets (+3%)",
    ],
    bestFor: ["Range-bound markets", "High volatility"],
    avoid: ["Strong trends", "Breakout scenarios"],
  },
  {
    id: "breakout",
    name: "Breakout Trading",
    type: "Volatility",
    icon: Zap,
    timeframe: "Daily",
    winRate: "45-55%",
    riskLevel: "Higher",
    bestMarket: "Consolidation",
    color: "amber",
    description:
      "After consolidation, prices often make explosive moves. Enter early in breakout with volume confirmation.",
    philosophy: "Catch the big moves early",
    entryConditions: [
      "20-day high breakout",
      "Volume surge (2x average)",
      "ATR expansion (volatility increasing)",
    ],
    exitConditions: [
      "ATR trailing stop (dynamic)",
      "Support break (trend reversal)",
      "Profit/loss targets (+6%/-2.5%)",
    ],
    bestFor: ["Consolidation periods", "Catalysts", "Earnings"],
    avoid: ["Already extended moves", "Low volume"],
  },
  {
    id: "scalping",
    name: "Day Trading Scalp",
    type: "High Frequency",
    icon: Timer,
    timeframe: "1-5 minutes",
    winRate: "50-55%",
    riskLevel: "Lower",
    bestMarket: "High Liquidity",
    color: "purple",
    description: "Capture small intraday moves with quick entries and exits. High win rate, small profits per trade.",
    philosophy: "Small profits, many times",
    entryConditions: [
      "EMA crossover (fast > slow)",
      "Price > VWAP (bullish momentum)",
      "Tight spreads (<$0.10)",
      "Momentum surge (short-term)",
    ],
    exitConditions: [
      "Quick profit targets (+0.5%)",
      "Tight stops (-0.3%)",
      "Time limits (5-minute max hold)",
    ],
    bestFor: ["High liquidity stocks", "Tight spreads", "Active hours (10AM-3PM)"],
    avoid: ["Market open/close", "Low volume periods", "Wide spreads"],
  },
]

const colorVariants = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    activeBg: "bg-emerald-500/20",
    activeBorder: "border-emerald-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    activeBg: "bg-blue-500/20",
    activeBorder: "border-blue-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    activeBg: "bg-amber-500/20",
    activeBorder: "border-amber-500",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    activeBg: "bg-purple-500/20",
    activeBorder: "border-purple-500",
  },
}

export function StrategiesSection() {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0])
  const colors = colorVariants[activeStrategy.color as keyof typeof colorVariants]

  return (
    <section id="strategies" className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Algorithmic Trading Strategies for Technical Analysts
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Four AI-powered algorithmic strategies leveraging technical indicators (MACD, RSI, Bollinger Bands, ATR)
              for different market conditions. Each strategy is powered by our multi-agent system analyzing chart patterns,
              volume signals, and momentum indicators with precision timing.
            </p>
          </div>
          <div className="relative h-48 w-72 overflow-hidden rounded-xl border border-border lg:h-56 lg:w-80">
            <Image src="/images/banner-ai-trade.png" alt="AI Trading Bot" fill className="object-cover" />
          </div>
        </div>

        {/* Strategy Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {strategies.map((strategy) => {
            const strategyColors = colorVariants[strategy.color as keyof typeof colorVariants]
            const isActive = activeStrategy.id === strategy.id
            return (
              <button
                key={strategy.id}
                onClick={() => setActiveStrategy(strategy)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? `${strategyColors.activeBg} ${strategyColors.activeBorder} ${strategyColors.text}`
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <strategy.icon className="h-4 w-4" />
                {strategy.name}
              </button>
            )
          })}
        </div>

        {/* Strategy Details */}
        <div className={cn("rounded-2xl border p-6 transition-colors lg:p-8", colors.border, colors.bg)}>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Overview */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colors.activeBg)}>
                  <activeStrategy.icon className={cn("h-6 w-6", colors.text)} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{activeStrategy.name}</h3>
                  <p className={cn("text-sm", colors.text)}>{activeStrategy.philosophy}</p>
                </div>
              </div>

              <p className="mb-6 text-muted-foreground">{activeStrategy.description}</p>

              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Timeframe</p>
                  <p className="font-semibold text-foreground">{activeStrategy.timeframe}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className={cn("font-semibold", colors.text)}>{activeStrategy.winRate}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="font-semibold text-foreground">{activeStrategy.riskLevel}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-3">
                  <p className="text-xs text-muted-foreground">Best Market</p>
                  <p className="font-semibold text-foreground">{activeStrategy.bestMarket}</p>
                </div>
              </div>

              {/* Best For / Avoid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Check className="h-4 w-4 text-emerald-400" />
                    Best For
                  </h4>
                  <ul className="space-y-1">
                    {activeStrategy.bestFor.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <X className="h-4 w-4 text-red-400" />
                    Avoid When
                  </h4>
                  <ul className="space-y-1">
                    {activeStrategy.avoid.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Conditions */}
            <div className="space-y-6">
              {/* Entry Conditions */}
              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                  <ChevronRight className="h-4 w-4 text-emerald-400" />
                  Entry Conditions
                </h4>
                <ul className="space-y-2">
                  {activeStrategy.entryConditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span
                        className={cn(
                          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          colors.bg,
                          colors.text,
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exit Conditions */}
              <div className="rounded-xl border border-border bg-card/50 p-5">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                  <ChevronRight className="h-4 w-4 text-red-400" />
                  Exit Conditions
                </h4>
                <ul className="space-y-2">
                  {activeStrategy.exitConditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-medium text-red-400">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
