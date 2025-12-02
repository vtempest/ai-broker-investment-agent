import { Button } from "@/components/ui/button"
import { ArrowRight, Users, MessageSquare, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8 min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img src="/images/image.png" alt="AI Trading Command Center" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Secondary accent image in corner */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-20 hidden lg:block">
        <img src="/images/image.png" alt="Robot Hand Trading" className="h-full w-full object-cover object-left-top" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
      </div>

      <div className="mx-auto max-w-5xl text-center relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">AI-Powered Investment Analysis</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Multi-Agent AI
          <span className="block text-primary">Investment Prediction</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Mirror the dynamics of real-world trading firms with specialized AI-powered agents. From fundamental analysts
          to risk management teams, collaboratively evaluate markets and make informed trading decisions.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="https://calendly.com/qwksearch/30min?month=2025-12" target="_blank">
              Book a Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, label: "4 Analyst Teams", desc: "Specialized analysis" },
            { icon: MessageSquare, label: "Dynamic Debates", desc: "Bull vs Bear research" },
            { icon: Shield, label: "Risk Management", desc: "Portfolio protection" },
            { icon: TrendingUp, label: "AI Predictions", desc: "Next-day forecasts" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm"
            >
              <item.icon className="h-8 w-8 text-primary" />
              <span className="font-semibold text-foreground">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
