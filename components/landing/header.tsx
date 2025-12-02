"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">TradingAgents</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#framework" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Framework
          </Link>
          <Link href="#teams" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Agent Teams
          </Link>
          <Link href="#architecture" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Architecture
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com/TauricResearch/TradingAgents" target="_blank">
              GitHub
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard">Launch App</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="#framework" className="text-sm text-muted-foreground">
              Framework
            </Link>
            <Link href="#teams" className="text-sm text-muted-foreground">
              Agent Teams
            </Link>
            <Link href="#architecture" className="text-sm text-muted-foreground">
              Architecture
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground">
              Dashboard
            </Link>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="https://github.com/TauricResearch/TradingAgents" target="_blank">
                  GitHub
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href="/dashboard">Launch App</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
