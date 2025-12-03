import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to Transform Your Trading?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Join traders who trust TimeTravel.investments for daily insights and next-day predictions.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Button size="lg" asChild>
            <Link href="https://calendly.com/qwksearch/30min?month=2025-12" target="_blank">
              <Calendar className="mr-2 h-5 w-5" />
              Book a Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
