"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
  ChevronUp,
  User2,
  LogOut,
  CreditCard,
  Search,
  Bell,
  Palette
} from 'lucide-react'
import { useSession, signOut } from "@/lib/auth-client"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail, SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SettingsDialog } from "@/components/settings/settings-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher"
import { themeNames, themeColors, formatThemeName } from "@/components/theme/theme-dropdown"

// Helper component for Search
function SidebarSearch() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<{ symbol: string, name: string }[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  React.useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 1) {
        setResults([])
        return
      }

      try {
        const res = await fetch(`/api/stocks/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
        const data = await res.json()
        if (data.success) {
          setResults(data.data)
          // Only open dropdown if input is focused
          if (document.activeElement === wrapperRef.current?.querySelector('input')) {
            setIsOpen(true)
          }
        }
      } catch (err) {
        console.error("Autocomplete failed", err)
      }
    }

    const timeoutId = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (symbol: string) => {
    setQuery(symbol)
    setIsOpen(false)
    // Close mobile sidebar if open
    if (state === "expanded") {
      toggleSidebar()
    }
    router.push(`/stock/${symbol}`)
  }

  if (state === "collapsed") {
    return (
      <Button variant="ghost" size="icon" onClick={() => toggleSidebar()}>
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div ref={wrapperRef} className="relative w-full px-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search stocks..."
          className="pl-8 h-8 bg-sidebar-accent/50 border-sidebar-border"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-2 right-2 mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.symbol}
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm flex items-center gap-2"
              onClick={() => handleSelect(item.symbol)}
            >
              <img
                src={`https://img.logo.dev/ticker/${item.symbol}?token=pk_TttrZhYwSReZxFePkXo-Bg&size=38&retina=true`}
                alt={`${item.symbol} logo`}
                className="w-5 h-5 rounded object-contain flex-shrink-0 bg-white"
                onError={(e) => {
                  // Fallback to hiding if logo fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="font-bold text-xs">{item.symbol}</span>
                <span className="text-muted-foreground truncate max-w-[100px] text-xs ml-1">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Navigation Configuration
const navigationGroups = [
  {
    title: "Trade",
    items: [
      { name: "Analyze Strategy", href: "/stock", icon: "/icons/icon-graph-chart.svg" },
      { name: "Prediction Markets", href: "/predict", icon: "/icons/icon-prediction-markets.png" },
    ],
  },
  {
    title: "Signal",
    items: [
      { name: "Market Scanner", href: "/markets", icon: "/icons/icon-market-screener.svg" },
      { name: "Copy Trade Leaders", href: "/leaders", icon: "/icons/icon-copy-trade.png" },
      // { name: "Orders", tab: "orders", icon: TrendingUp },
    ],
  },
  {
    title: "Risk & Portfolio",
    items: [
      { name: "Portfolio Management", href: "/portfolio", icon: "/icons/icon-indicators.png" },
    ],
  },
]

function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'
  const { data: session } = useSession()
  const user = session?.user || { name: "Guest User", email: "guest@example.com", image: null }
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = React.useState("modern-minimal")
  const [mounted, setMounted] = React.useState(false)
  const [previewTheme, setPreviewTheme] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("color-theme")
    if (saved && themeNames.includes(saved)) {
      setColorTheme(saved)
    }
  }, [])

  const handleThemeChange = (newTheme: string) => {
    setColorTheme(newTheme)
    localStorage.setItem("color-theme", newTheme)
    document.cookie = `color-theme=${newTheme}; path=/; max-age=31536000`

    // Remove all theme classes
    themeNames.forEach(t => document.documentElement.classList.remove(`theme-${t}`))
    // Add new theme class
    document.documentElement.classList.add(`theme-${newTheme}`)

    setPreviewTheme(null)
  }

  const handleThemePreview = (themeName: string) => {
    setPreviewTheme(themeName)
    // Remove all theme classes
    themeNames.forEach(t => document.documentElement.classList.remove(`theme-${t}`))
    // Add preview theme class
    document.documentElement.classList.add(`theme-${themeName}`)
  }

  const handlePreviewEnd = () => {
    if (previewTheme) {
      // Restore the actual selected theme
      themeNames.forEach(t => document.documentElement.classList.remove(`theme-${t}`))
      document.documentElement.classList.add(`theme-${colorTheme}`)
      setPreviewTheme(null)
    }
  }


  // Helper to determine active state
  const isActive = (tab?: string, href?: string) => {
    if (href) return pathname === href
    if (tab) return pathname === '/dashboard' && currentTab === tab
    return false
  }

  const userInitials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "GU"

  // Determine logo link based on current page
  const logoHref = pathname.startsWith('/docs') ? '/dashboard' : '/'

  return (
    < Sidebar collapsible="icon" {...props} >
      <SidebarHeader className="pt-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={logoHref}>
                <div className=" flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="size-4 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">AI Broker</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSearch />
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const IconComponent = typeof item.icon === 'string' ? null : item.icon;
                  const iconPath = typeof item.icon === 'string' ? item.icon : null;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive((item as any).tab, (item as any).href)}
                        tooltip={item.name}
                      >
                        <Link href={(item as any).href || `/dashboard?tab=${(item as any).tab}`}>
                          {iconPath ? (
                            <Image
                              src={iconPath}
                              alt={item.name}
                              width={24}
                              height={24}
                              className="w-6 h-6 shrink-0"
                              unoptimized
                            />
                          ) : null}
                          <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SettingsDialog
                  trigger={
                    <SidebarMenuButton tooltip="Settings">
                      <Image
                        src="/icons/icon-settings.svg"
                        alt="Settings"
                        width={24}
                        height={24}
                        className="w-6 h-6 shrink-0"
                        unoptimized
                      />
                      <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/docs'}
                  tooltip="Documentation"
                >
                  <Link href="/docs">
                    <Image
                      src="/icons/icon-user-guide.svg"
                      alt="Documentation"
                      width={24}
                      height={24}
                      className="w-6 h-6 shrink-0"
                      unoptimized
                    />
                    <span className="group-data-[collapsible=icon]:hidden">Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu onOpenChange={(open) => !open && handlePreviewEnd()}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user.name || "Guest"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  {/* <div className="relative group-data-[collapsible=icon]:hidden">
                    <Bell className="h-4 w-4 ml-auto text-muted-foreground" />
                     <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-sidebar-accent" />
                  </div> */}
                  <ChevronUp className="ml-2 size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name || "Guest"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <SettingsDialog
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User2 className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Color Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
                      <div className="px-2 py-1.5 flex items-center justify-center">
                        <CinematicThemeSwitcher />
                      </div>
                      <DropdownMenuSeparator />
                      {themeNames.map((themeName) => {
                        const colors = themeColors[themeName];
                        return (
                          <DropdownMenuItem
                            key={themeName}
                            onClick={() => handleThemeChange(themeName)}
                            onMouseEnter={() => handleThemePreview(themeName)}
                            onMouseLeave={handlePreviewEnd}
                            className={colorTheme === themeName ? "bg-accent" : ""}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-3 h-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: colors.primary }}
                                  />
                                  <div
                                    className="w-3 h-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: colors.secondary }}
                                  />
                                </div>
                                <span>{formatThemeName(themeName)}</span>
                              </div>
                              {colorTheme === themeName && (
                                <span className="text-xs">✓</span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  await signOut()
                  router.push("/")
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Suspense fallback={<Sidebar collapsible="icon" {...props} />}>
      <AppSidebarContent {...props} />
    </Suspense>
  )
}
