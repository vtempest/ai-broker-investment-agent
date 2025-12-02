import { Button } from "@/components/ui/button"
import { ArrowRight, Users, MessageSquare, Shield, GitBranch } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">Built with LangGraph by Tauric Research</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Multi-Agent LLM
          <span className="block text-primary">Financial Trading Framework</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Mirror the dynamics of real-world trading firms with specialized LLM-powered agents. From fundamental analysts
          to risk management teams, collaboratively evaluate markets and make informed trading decisions.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Try Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="https://github.com/TauricResearch/TradingAgents" target="_blank">
              <GitBranch className="mr-2 h-4 w-4" /> View on GitHub
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { icon: Users, label: "4 Analyst Teams", desc: "Specialized analysis" },
            { icon: MessageSquare, label: "Dynamic Debates", desc: "Bull vs Bear research" },
            { icon: Shield, label: "Risk Management", desc: "Portfolio protection" },
            { icon: GitBranch, label: "Open Source", desc: "LangGraph powered" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/50 p-6"
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
