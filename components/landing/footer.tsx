import Link from "next/link"
import { Activity } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">TradingAgents</span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="https://github.com/TauricResearch/TradingAgents"
              target="_blank"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <Link href="https://arxiv.org/abs/2412.20138" target="_blank" className="hover:text-foreground">
              Paper
            </Link>
            <Link href="#" className="hover:text-foreground">
              Discord
            </Link>
            <Link href="#" className="hover:text-foreground">
              Community
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tauric Research. Open source under MIT License.
        </div>
      </div>
    </footer>
  )
}
