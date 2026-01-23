import { HeroSection } from "@/components/landing/hero-section"
import { BrokerPlatformsSection } from "@/components/landing/broker-platforms-section"
import { AgentsSection } from "@/components/landing/agents-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { StrategiesSection } from "@/components/landing/strategies-section"
import { SignalIndicators } from "@/components/landing/signal-indicators"
import { PredictionMarketsSection } from "@/components/landing/prediction-markets-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="pr-[200px] min-h-screen bg-background  overflow-x-hidden">
      <main className=" w-full  overflow-x-hidden">
        <HeroSection />
        <ArchitectureSection />
        <AgentsSection />
        <SignalIndicators />

        <BrokerPlatformsSection />
        <PredictionMarketsSection />
        <StrategiesSection />
        {/* <CTASection /> */}
      </main>
      <Footer />
    </div>
  )
}
