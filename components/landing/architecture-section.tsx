import { ArrowRight, ArrowDown } from "lucide-react"

const workflow = [
  { name: "Analyst Team", desc: "4 specialized analysts gather data", color: "text-chart-1", border: "border-chart-1" },
  { name: "Researcher Team", desc: "Bull vs Bear structured debates", color: "text-chart-2", border: "border-chart-2" },
  { name: "Trader Agent", desc: "Synthesizes insights for decisions", color: "text-chart-3", border: "border-chart-3" },
  {
    name: "Risk Management",
    desc: "Evaluates and adjusts strategies",
    color: "text-chart-4",
    border: "border-chart-4",
  },
  { name: "Portfolio Manager", desc: "Final approval & execution", color: "text-chart-5", border: "border-chart-5" },
]

export function ArchitectureSection() {
  return (
    <section id="architecture" className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">LangGraph Architecture</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Built for flexibility and modularity, agents engage in dynamic discussions to pinpoint optimal strategies.
          </p>
        </div>

        <div className="mt-16">
          {/* Desktop Flow */}
          <div className="hidden items-center justify-center gap-2 lg:flex">
            {workflow.map((step, index) => (
              <div key={step.name} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${step.border} bg-card font-mono text-lg font-bold ${step.color}`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-4 w-36 text-center">
                    <div className="font-semibold text-foreground">{step.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{step.desc}</div>
                  </div>
                </div>
                {index < workflow.length - 1 && <ArrowRight className="mx-3 h-5 w-5 text-primary" />}
              </div>
            ))}
          </div>

          {/* Mobile Flow */}
          <div className="flex flex-col gap-3 lg:hidden">
            {workflow.map((step, index) => (
              <div key={step.name}>
                <div className={`flex items-center gap-4 rounded-lg border ${step.border} bg-card p-4`}>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${step.border} font-mono font-bold ${step.color}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{step.name}</div>
                    <div className="text-sm text-muted-foreground">{step.desc}</div>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="mt-16 rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-sm">
              <div className="text-muted-foreground">{"// TradingAgents LangGraph Workflow"}</div>
              <div className="mt-4">
                <span className="text-chart-1">Analyst Team</span>
                <span className="text-muted-foreground"> (Fundamentals, Sentiment, News, Technical)</span>
              </div>
              <div className="ml-4 text-muted-foreground">{"↓ Insights and market analysis"}</div>
              <div className="mt-2">
                <span className="text-chart-2">Researcher Team</span>
                <span className="text-muted-foreground"> (Bullish vs Bearish Debate)</span>
              </div>
              <div className="ml-4 text-muted-foreground">{"↓ Structured debates balance risks and gains"}</div>
              <div className="mt-2">
                <span className="text-chart-3">Trader Agent</span>
              </div>
              <div className="ml-4 text-muted-foreground">{"↓ Synthesizes reports, determines timing & magnitude"}</div>
              <div className="mt-2">
                <span className="text-chart-4">Risk Management Team</span>
              </div>
              <div className="ml-4 text-muted-foreground">{"↓ Evaluates volatility, liquidity, adjusts strategy"}</div>
              <div className="mt-2">
                <span className="text-chart-5">Portfolio Manager</span>
              </div>
              <div className="ml-4 text-muted-foreground">{"→ Approves/rejects → Simulated Exchange Execution"}</div>
            </div>
          </div>

          {/* Python Usage */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 text-sm font-medium text-foreground">Quick Start</div>
            <pre className="overflow-x-auto text-sm">
              <code className="text-muted-foreground">
                {`from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())
_, decision = ta.propagate("NVDA", "2024-05-10")
print(decision)`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
