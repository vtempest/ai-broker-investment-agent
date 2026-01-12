import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"
import "./themes-shadcn.css"

export const metadata: Metadata = {
  title: "AI Broker - LLM Agents Debate Stocks & Events",
  description:
    "AI multi-agent stock & event markets system with next-day price predictions and comprehensive trading insights",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
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
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
