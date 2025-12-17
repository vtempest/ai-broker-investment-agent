import type React from "react"
import type { Metadata } from "next"
import { Open_Sans } from "next/font/google"
import { cookies } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"
import "../styles/themes-shadcn.css"

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans"
})

export const metadata: Metadata = {
  title: "AI Broker - LLM Agents Debate Stocks & Events",
  description:
    "AI multi-agent stock & event markets system with next-day price predictions and comprehensive trading insights",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  viewport: "width=device-width, initial-scale=1",
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
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
