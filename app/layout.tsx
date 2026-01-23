import type React from "react"
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"
import "@/components/theme/themes-shadcn.css"
import { StockTicker } from "@/components/dashboard/shared/stock-scrolling-banner"

export const metadata: Metadata = {
  title: "AI Broker - LLM Agents Debate Stocks & Events",
  description:
    "AI multi-agent stock & event markets system with next-day price predictions and comprehensive trading insights",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("color-theme")?.value || "modern-minimal"

  return (
    <html lang="en" suppressHydrationWarning className={`theme-${theme}`}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Stock Ticker - Fixed at Top */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <StockTicker />
          </div>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
