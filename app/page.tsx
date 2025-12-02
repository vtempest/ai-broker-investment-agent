import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { AgentsSection } from "@/components/landing/agents-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { StrategiesSection } from "@/components/landing/strategies-section"
import { SignalIndicators } from "@/components/landing/signal-indicators"
import { FeaturesSection } from "@/components/landing/features-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AgentsSection />
        <ArchitectureSection />
        <StrategiesSection />
        <SignalIndicators />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
