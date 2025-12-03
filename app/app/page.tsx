"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/app/dashboard-header"
import { DashboardSidebar } from "@/components/app/dashboard-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/app/overview-tab"
import { SignalsTab } from "@/components/app/signals-tab"
import { StrategiesTab } from "@/components/app/strategies-tab"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AppPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={session.user} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={session.user} onSignOut={signOut} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <OverviewTab />
              </TabsContent>

              <TabsContent value="signals" className="space-y-6 mt-6">
                <SignalsTab />
              </TabsContent>

              <TabsContent value="strategies" className="space-y-6 mt-6">
                <StrategiesTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
