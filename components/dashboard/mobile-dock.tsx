"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  Zap,
  Target,
  Copy,
  Shield,
  BarChart3,
} from 'lucide-react'
import Dock from "@/components/ui/dock"

export function MobileDock() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const dockItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      onClick: () => router.push("/dashboard?tab=overview")
    },
    {
      icon: Zap,
      label: "Strategies",
      onClick: () => router.push("/dashboard?tab=strategies")
    },
    {
      icon: BarChart3,
      label: "Scanner",
      onClick: () => router.push("/dashboard?tab=scanner")
    },
    {
      icon: Copy,
      label: "Copy Trade",
      onClick: () => router.push("/dashboard?tab=copy-trading")
    },
    {
      icon: Target,
      label: "Markets",
      onClick: () => router.push("/dashboard?tab=prediction-markets")
    },
    {
      icon: Shield,
      label: "Risk",
      onClick: () => router.push("/dashboard?tab=risk")
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm border-t">
      <Dock items={dockItems} className="py-2" />
    </div>
  )
}
