"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  BarChart3, 
  LineChart, 
  Plus,
  Star,
  List,
  Trash2, 
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StockList, StockData } from "@/components/dashboard/shared/stock-list"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { FinancialTable, type MarketIndex } from "@/components/ui/financial-markets-table"

// Mock data (carried over from IndexScreenerTab)
const mockIndexes: StockData[] = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 478.23, change: 2.45, changePercent: 0.51, volume: 82500000 },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 412.34, change: -1.23, changePercent: -0.30, volume: 45200000 },
  { symbol: "DIA", name: "Dow Jones ETF", price: 387.65, change: 0.87, changePercent: 0.22, volume: 3800000 },
  { symbol: "IWM", name: "Russell 2000 ETF", price: 203.45, change: 1.56, changePercent: 0.77, volume: 28900000 },
  { symbol: "VTI", name: "Total Market ETF", price: 267.89, change: 2.12, changePercent: 0.80, volume: 4200000 },
]

const mostTrending: StockData[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: 875.28, change: 45.67, changePercent: 5.51, volume: 52800000, indicator: 95 },
  { symbol: "TSLA", name: "Tesla Inc", price: 248.42, change: 12.34, changePercent: 5.23, volume: 98500000, indicator: 89 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 178.56, change: 8.92, changePercent: 5.26, volume: 67200000, indicator: 87 },
  { symbol: "META", name: "Meta Platforms", price: 512.76, change: 18.45, changePercent: 3.73, volume: 15600000, indicator: 82 },
  { symbol: "AAPL", name: "Apple Inc", price: 195.89, change: 3.21, changePercent: 1.67, volume: 54300000, indicator: 78 },
  { symbol: "MSFT", name: "Microsoft Corp", price: 420.15, change: 5.67, changePercent: 1.37, volume: 28900000, indicator: 75 },
]

const highestBreakout: StockData[] = [
  { symbol: "SMCI", name: "Super Micro Computer", price: 892.45, change: 89.23, changePercent: 11.12, volume: 23400000, indicator: 22.5 },
  { symbol: "PLTR", name: "Palantir Technologies", price: 28.67, change: 2.89, changePercent: 11.21, volume: 45200000, indicator: 20.8 },
  { symbol: "COIN", name: "Coinbase Global", price: 178.34, change: 15.67, changePercent: 9.63, volume: 12800000, indicator: 18.3 },
  { symbol: "RIOT", name: "Riot Platforms", price: 18.92, change: 1.45, changePercent: 8.30, volume: 34500000, indicator: 16.7 },
  { symbol: "MARA", name: "Marathon Digital", price: 24.56, change: 1.87, changePercent: 8.24, volume: 28900000, indicator: 15.2 },
]

const highestMACD: StockData[] = [
  { symbol: "GOOGL", name: "Alphabet Inc", price: 156.78, change: 4.56, changePercent: 3.00, volume: 28900000, indicator: 4.8 },
  { symbol: "AMZN", name: "Amazon.com Inc", price: 178.45, change: 5.23, changePercent: 3.02, volume: 45600000, indicator: 4.2 },
  { symbol: "NFLX", name: "Netflix Inc", price: 567.89, change: 12.34, changePercent: 2.22, volume: 8900000, indicator: 3.9 },
  { symbol: "CRM", name: "Salesforce Inc", price: 298.45, change: 6.78, changePercent: 2.32, volume: 6700000, indicator: 3.5 },
]

// Fallback static data for when API is unavailable
const fallbackGlobalMarketIndices: MarketIndex[] = [
  {
    id: "usa30idxusd",
    name: "Dow Jones",
    country: "USA",
    countryCode: "US",
    volume: 0,
    chartData: [],
    price: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    monthlyChangePercent: 0,
    yearlyChangePercent: 0
  }
]

interface Watchlist {
  id: string
  name: string
  description?: string
  createdAt: string
}

export function MarketScanner() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("global-markets")
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loadingLists, setLoadingLists] = useState(false)

  // Global Markets State
  const [globalMarkets, setGlobalMarkets] = useState<MarketIndex[]>([])
  const [loadingGlobalMarkets, setLoadingGlobalMarkets] = useState(true)

  // Create List State
  const [createOpen, setCreateOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [creating, setCreating] = useState(false)

  // Fetch Global Markets from Dukascopy API
  const fetchGlobalMarkets = async () => {
    try {
      setLoadingGlobalMarkets(true)
      const res = await fetch("/api/markets/global")
      const json = await res.json()
      if (json.success && json.data) {
        setGlobalMarkets(json.data)
      }
    } catch (error) {
      console.error("Failed to fetch global markets", error)
    } finally {
      setLoadingGlobalMarkets(false)
    }
  }

  // Fetch global markets on mount and refresh every 60 seconds
  useEffect(() => {
    fetchGlobalMarkets()
    const interval = setInterval(fetchGlobalMarkets, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch Watchlists
  const fetchWatchlists = async () => {
    if (!session?.user) return
    try {
      setLoadingLists(true)
      const res = await fetch("/api/user/watchlists")
      const json = await res.json()
      if (json.success) {
        setWatchlists(json.data)
      }
    } catch (error) {
      console.error("Failed to fetch watchlists", error)
    } finally {
      setLoadingLists(false)
    }
  }

  useEffect(() => {
    fetchWatchlists()
  }, [session])

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim()) return

    try {
      setCreating(true)
      const res = await fetch("/api/user/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName }),
      })
      const json = await res.json()

      if (json.success) {
        toast.success("Watchlist created")
        setWatchlists([...watchlists, json.data])
        setNewListName("")
        setCreateOpen(false)
        setActiveTab(`list-${json.data.id}`)
      } else {
        toast.error(json.error || "Failed to create list")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return

    try {
      const res = await fetch(`/api/user/watchlists?id=${listId}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (json.success) {
        toast.success("Watchlist deleted")
        setWatchlists(prev => prev.filter(l => l.id !== listId))
        setActiveTab("favorites")
      } else {
        toast.error(json.error || "Failed to delete list")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Market Scanner</h2>
          <p className="text-muted-foreground">
            Track market indexes, trending stocks, and your custom watchlists.
          </p>
        </div>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Watchlist</DialogTitle>
              <DialogDescription>
                Give your watchlist a name to start tracking symbols.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateList}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={newListName} 
                    onChange={(e) => setNewListName(e.target.value)} 
                    placeholder="e.g., High Growth, Dividend Aristocrats" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !newListName}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Market Stats Cards (Keep existing mock stats for flavor) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Indexes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{mockIndexes.length}</div>
             <p className="text-xs text-muted-foreground">Trackers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{mostTrending.length}</div>
             <p className="text-xs text-muted-foreground">High Momentum</p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breakout</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{highestBreakout.length}</div>
             <p className="text-xs text-muted-foreground">Above 20-day high</p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Lists</CardTitle>
            <List className="h-4 w-4 text-blue-500" />
          </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{watchlists.length + 1}</div>
             <p className="text-xs text-muted-foreground">Includes Favorites</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="w-full overflow-x-auto touch-pan-x pb-2">
          <TabsList>
            <TabsTrigger value="global-markets">Global Markets</TabsTrigger>
            <TabsTrigger value="indexes">Indexes</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="breakout">Breakout</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            {watchlists.map(list => (
              <TabsTrigger key={list.id} value={`list-${list.id}`}>
                {list.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Static Tabs */}
        <TabsContent value="global-markets">
          {loadingGlobalMarkets ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <FinancialTable
              title="Index"
              indices={globalMarkets.length > 0 ? globalMarkets : fallbackGlobalMarketIndices}
              onIndexSelect={(indexId) => console.log("Selected index:", indexId)}
            />
          )}
        </TabsContent>
        <TabsContent value="indexes">
          <StockList
            title="Market Indexes"
            mode="static"
            initialStocks={mockIndexes}
          />
        </TabsContent>
        <TabsContent value="trending">
          <StockList 
            title="Most Trending" 
            mode="static" 
            initialStocks={mostTrending}
            showIndicator 
            indicatorLabel="Momentum"
          />
        </TabsContent>
        <TabsContent value="breakout">
          <StockList 
            title="Highest Breakout" 
            mode="static" 
            initialStocks={highestBreakout}
            showIndicator
            indicatorLabel="ATR"
          />
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <StockList
            title="Favorites"
            description="Your default watchlist"
            mode="watchlist"
            listId={null}
          />
        </TabsContent>

        {/* Dynamic Watchlist Tabs */}
        {watchlists.map(list => (
          <TabsContent key={list.id} value={`list-${list.id}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => handleDeleteList(list.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </Button>
              </div>
              <StockList
                title={list.name}
                description={list.description}
                mode="watchlist"
                listId={list.id}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
