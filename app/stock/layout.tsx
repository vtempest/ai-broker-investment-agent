import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { MobileDock } from "@/components/dashboard/layout/mobile-dock"
import { StockTicker } from "@/components/dashboard/shared/stock-scrolling-banner"

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
