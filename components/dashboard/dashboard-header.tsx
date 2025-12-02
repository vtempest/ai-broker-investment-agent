"use client"

import { Bell, Search, Menu, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">PrimoAgent</span>
              </Link>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/analysis"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                Analysis
              </Link>
              <Link
                href="/dashboard/agents"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                Agents
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground"
              >
                Reports
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search stocks, analysis..." className="w-64 pl-9 bg-secondary border-border" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
