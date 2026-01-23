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

  const dockItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      onClick: () => router.push("/dashboard")
    },
    {
      icon: Zap,
      label: "Strategies",
      onClick: () => router.push("/stock")
    },
    {
      icon: BarChart3,
      label: "Scanner",
      onClick: () => router.push("/markets")
    },
    {
      icon: Copy,
      label: "Copy Trade",
      onClick: () => router.push("/leaders")
    },
    {
      icon: Target,
      label: "Markets",
      onClick: () => router.push("/predict")
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm border-t">
      <Dock items={dockItems} className="py-2" />
    </div>
  )
}
