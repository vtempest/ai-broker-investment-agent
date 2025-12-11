import { Button } from "@/components/ui/button"
import {
  Users,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Clock,
  Bot,
  Newspaper,
  TrendingDown,
  Calendar,
} from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8 min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img src="/images/banner-ai-trade.png" alt="AI Trading Command Center" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
      </div>

      <div className="mx-auto max-w-5xl text-center relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Chatbot Simplexity for Algorithmic Trading</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Chatbot Automation of Algorithmic Trading for
          <span className="block text-primary">Everyday Investors</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Deploy specialized AI agents with algorithmic trading strategies across stocks and prediction markets. Track
          sharp traders on Polymarket & Kalshi, analyze outcomes with LLM-powered research, and execute momentum,
          breakout, and scalping strategies with institutional-grade risk management.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="https://takemymoney.timetravel.investments" target="_blank">
              <Calendar className="mr-2 h-5 w-5" />
              Book a Demo
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, label: "Multi-Agent Teams", desc: "4 specialized analysts" },
            { icon: BarChart3, label: "Algo Strategies", desc: "Momentum & breakout" },
            { icon: TrendingUp, label: "Prediction Markets", desc: "Polymarket & Kalshi" },
            { icon: MessageSquare, label: "Copy Trading", desc: "Follow top performers" },
            { icon: Clock, label: "Time Travel Backtesting", desc: "Test strategies in the past" },
            { icon: Bot, label: "Chatbot Algo Builder", desc: "Modify rules with AI chat" },
            { icon: Newspaper, label: "News Opinion Scanner", desc: "AI judges sentiment shifts" },
            { icon: TrendingDown, label: "Senate & Investor Tracking", desc: "Follow insider moves" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm hover:bg-card/70 transition-colors"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <span className="font-semibold text-foreground text-center text-sm">{item.label}</span>
              <span className="text-xs text-muted-foreground text-center">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
