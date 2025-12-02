import { Zap, Shield, BarChart3, Clock, Globe, Lock } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Real-time Analysis",
    description: "Process market data instantly with our optimized multi-agent pipeline.",
  },
  {
    icon: Shield,
    title: "Risk Minimization",
    description: "Deep analysis to identify potential losses before they happen.",
  },
  {
    icon: BarChart3,
    title: "Price Predictions",
    description: "Next-day price predictions powered by comprehensive market analysis.",
  },
  {
    icon: Clock,
    title: "Daily Insights",
    description: "Fresh trading insights generated every market day.",
  },
  {
    icon: Globe,
    title: "Multi-source Data",
    description: "Aggregate data from news, social media, and financial reports.",
  },
  {
    icon: Lock,
    title: "Secure Processing",
    description: "Your analysis data is encrypted and never shared.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border bg-secondary/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built for Traders</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Everything you need to make informed trading decisions with confidence.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
