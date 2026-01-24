import { HeroSection } from "@/components/landing/hero-section"
import { BrokerPlatformsSection } from "@/components/landing/broker-platforms-section"
import { AgentsSection } from "@/components/landing/agents-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { StrategiesSection } from "@/components/landing/strategies-section"
import { SignalIndicators } from "@/components/landing/signal-indicators"
import { PredictionMarketsSection } from "@/components/landing/prediction-markets-section"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden pt-6">
      <Header />
      <HeroSection />
      <ArchitectureSection />
      <AgentsSection />
      <SignalIndicators />
      <BrokerPlatformsSection />
      <PredictionMarketsSection />
      <StrategiesSection />

      <Footer />
    </main>
  )
}
