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

      <SidebarInset className="pb-24 md:pb-0">
        {/* Stock Ticker - Fixed at Top */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <StockTicker />
        </div>


        {children}
      </SidebarInset>

      <MobileDock />
    </SidebarProvider>
  )
}
