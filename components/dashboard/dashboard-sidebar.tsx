"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  LayoutDashboard,
  Signal,
  Users,
  Settings,
  TrendingUp,
  Target,
  Copy,
  Shield,
  HelpCircle,
  Menu,
  X,
  Zap,
  ChevronUp,
  LogOut,
  User2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "@/lib/auth-client"

interface DashboardSidebarProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

const navigation = [
  { name: "Overview", value: "overview", icon: LayoutDashboard },
  { name: "API Data", value: "api-data", icon: Activity },
  { name: "Alpaca Trading", value: "alpaca", icon: TrendingUp },
  { name: "Signals", value: "signals", icon: Signal },
  { name: "Agents", value: "agents", icon: Users },
  { name: "Strategies", value: "strategies", icon: Zap },
  { name: "Prediction Markets", value: "prediction-markets", icon: Target },
  { name: "Copy Trading", value: "copy-trading", icon: Copy },
  { name: "Risk & Portfolio", value: "risk", icon: Shield },
]


function SidebarContent({ activeTab, setActiveTab, onItemClick }: DashboardSidebarProps & { onItemClick?: () => void }) {
  const { data: session } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const user = session?.user
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"

  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">PrimoAgent</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setActiveTab?.(item.value)
                onItemClick?.()
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                activeTab === item.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-1">
          <Link
            href="/dashboard/settings"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            onClick={onItemClick}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                  <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="truncate font-medium">{user.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronUp className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              side="top"
              sideOffset={8}
            >
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                  <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="truncate font-medium">{user.name || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer" onClick={onItemClick}>
                  <User2 className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  )
}

export function DashboardSidebar({ activeTab = "overview", setActiveTab }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Sidebar - Sheet/Drawer */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>
    </>
  )
}
