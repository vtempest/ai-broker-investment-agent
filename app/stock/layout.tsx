import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileDock } from "@/components/layout/mobile-dock"
import { StockTicker } from "@/components/investing/stock-ticker"

export default function StockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className=" md:pb-0">



        {children}
      </SidebarInset>

      <MobileDock />
    </SidebarProvider>
  )
}
