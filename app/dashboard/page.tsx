import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { StockOverview } from "@/components/dashboard/stock-overview"
import { AgentsPipeline } from "@/components/dashboard/agents-pipeline"
import { PriceChart } from "@/components/dashboard/price-chart"
import { SentimentPanel } from "@/components/dashboard/sentiment-panel"
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel"
import { RecentAnalysis } from "@/components/dashboard/recent-analysis"
import { ResearchDebate } from "@/components/dashboard/research-debate"
import { StrategiesPanel } from "@/components/dashboard/strategies-panel"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <StockOverview />
            <AgentsPipeline />
            <StrategiesPanel />
            <ResearchDebate />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PriceChart />
              </div>
              <div className="space-y-6">
                <SentimentPanel />
                <RecommendationsPanel />
              </div>
            </div>
            <RecentAnalysis />
          </div>
        </main>
      </div>
    </div>
  )
}
