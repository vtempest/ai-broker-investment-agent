"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TrendingUp, TrendingDown, Plus, X, Settings, CalendarDays, Play, Pause } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  monthlyChange: number
  monthlyChangePercent: number
  high: number
  low: number
  volume: string
  type: "index" | "stock"
}

function getStockLogoUrl(symbol: string): string {
  return `https://img.logo.dev/ticker/${symbol}?token=pk_TttrZhYwSReZxFePkXo-Bg&size=38&retina=true`
}

const defaultWatchlist = [
  // Major Indexes
  { symbol: "SPX", name: "S&P 500", basePrice: 5892.34, type: "index" as const },
  { symbol: "DJI", name: "Dow Jones", basePrice: 43127.56, type: "index" as const },
  { symbol: "IXIC", name: "NASDAQ", basePrice: 19234.12, type: "index" as const },
  { symbol: "RUT", name: "Russell 2000", basePrice: 2089.45, type: "index" as const },
  { symbol: "VIX", name: "Volatility Index", basePrice: 18.42, type: "index" as const },
  { symbol: "FTSE", name: "FTSE 100", basePrice: 8234.56, type: "index" as const },
  { symbol: "DAX", name: "DAX 40", basePrice: 18456.78, type: "index" as const },
  { symbol: "N225", name: "Nikkei 225", basePrice: 38234.12, type: "index" as const },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 242.56, type: "stock" as const },
  { symbol: "MSFT", name: "Microsoft", basePrice: 438.92, type: "stock" as const },
  { symbol: "GOOGL", name: "Alphabet", basePrice: 178.34, type: "stock" as const },
  { symbol: "AMZN", name: "Amazon", basePrice: 198.76, type: "stock" as const },
  { symbol: "NVDA", name: "NVIDIA", basePrice: 142.89, type: "stock" as const },
  { symbol: "TSLA", name: "Tesla", basePrice: 412.34, type: "stock" as const },
  { symbol: "META", name: "Meta Platforms", basePrice: 612.45, type: "stock" as const },
  { symbol: "JPM", name: "JPMorgan Chase", basePrice: 245.67, type: "stock" as const },
  { symbol: "V", name: "Visa Inc.", basePrice: 298.45, type: "stock" as const },
  { symbol: "WMT", name: "Walmart", basePrice: 178.23, type: "stock" as const },
  { symbol: "UNH", name: "UnitedHealth", basePrice: 534.67, type: "stock" as const },
  { symbol: "HD", name: "Home Depot", basePrice: 389.12, type: "stock" as const },
  { symbol: "PG", name: "Procter & Gamble", basePrice: 167.89, type: "stock" as const },
  { symbol: "MA", name: "Mastercard", basePrice: 478.34, type: "stock" as const },
  { symbol: "XOM", name: "Exxon Mobil", basePrice: 112.45, type: "stock" as const },
  { symbol: "JNJ", name: "Johnson & Johnson", basePrice: 156.78, type: "stock" as const },
  { symbol: "BAC", name: "Bank of America", basePrice: 38.92, type: "stock" as const },
  { symbol: "KO", name: "Coca-Cola", basePrice: 62.34, type: "stock" as const },
  { symbol: "DIS", name: "Walt Disney", basePrice: 112.56, type: "stock" as const },
  { symbol: "NFLX", name: "Netflix", basePrice: 678.23, type: "stock" as const },
]

function generateTickerData(watchlist: typeof defaultWatchlist): TickerData[] {
  return watchlist.map((item) => {
    const volatility = item.type === "index" ? 0.002 : 0.005
    const monthlyVolatility = item.type === "index" ? 0.03 : 0.08
    const change = (Math.random() - 0.5) * 2 * item.basePrice * volatility
    const monthlyChange = (Math.random() - 0.5) * 2 * item.basePrice * monthlyVolatility
    const price = item.basePrice + change
    const changePercent = (change / item.basePrice) * 100
    const monthlyChangePercent = (monthlyChange / item.basePrice) * 100
    const high = price + Math.random() * item.basePrice * 0.01
    const low = price - Math.random() * item.basePrice * 0.01
    const volume =
      item.type === "index"
        ? `${(Math.random() * 5 + 1).toFixed(1)}B`
        : `${(Math.random() * 50 + 10).toFixed(1)}M`

    return {
      symbol: item.symbol,
      name: item.name,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      monthlyChange: Number(monthlyChange.toFixed(2)),
      monthlyChangePercent: Number(monthlyChangePercent.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      volume,
      type: item.type,
    }
  })
}

function TickerItem({ data }: { data: TickerData }) {
  const isDailyPositive = data.change >= 0
  const isMonthlyPositive = data.monthlyChange >= 0

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-muted/50 transition-colors text-xs">
            <Image
              src={getStockLogoUrl(data.symbol) || "/placeholder.svg"}
              alt={data.symbol}
              width={16}
              height={16}
              className="rounded-sm"
              unoptimized
            />
            <span className="font-semibold text-foreground">{data.symbol}</span>
            <span className=" text-foreground">{data.name}</span>
            {/* <span className="font-mono text-foreground">
              ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span> */}
            <div
              className={cn(
                "flex items-center gap-0.5 font-mono",
                isDailyPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {isDailyPositive ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              <span>
                {data.changePercent.toFixed(2)}%
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-0.5 font-mono",
                isMonthlyPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
              <span>
                {data.monthlyChangePercent.toFixed(0)}%
              </span>
            </div>
            <span className="text-muted-foreground/50">|</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="p-3 bg-popover text-popover-foreground"
        >
          <div className="space-y-2">
            <div className="font-semibold text-sm">{data.name}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono">${data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono">${data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono">{data.volume}</span>
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline" className="w-fit text-xs capitalize">
                {data.type}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StockTicker() {
  const [watchlist, setWatchlist] = useState(defaultWatchlist)
  const [tickerData, setTickerData] = useState<TickerData[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [newSymbol, setNewSymbol] = useState("")
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"index" | "stock">("stock")
  const [dialogOpen, setDialogOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const updateTickerData = useCallback(() => {
    setTickerData(generateTickerData(watchlist))
  }, [watchlist])

  useEffect(() => {
    updateTickerData()
    const interval = setInterval(() => {
      if (!isPaused) {
        updateTickerData()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [updateTickerData, isPaused])

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    const scrollSpeed = 0.5

    const autoScroll = setInterval(() => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft += scrollSpeed
      }
    }, 16)

    return () => clearInterval(autoScroll)
  }, [isHovered])

  const addSymbol = () => {
    if (!newSymbol.trim() || !newName.trim()) return
    const exists = watchlist.some(
      (item) => item.symbol.toUpperCase() === newSymbol.toUpperCase()
    )
    if (exists) return

    setWatchlist((prev) => [
      ...prev,
      {
        symbol: newSymbol.toUpperCase(),
        name: newName,
        basePrice: Math.random() * 500 + 50,
        type: newType,
      },
    ])
    setNewSymbol("")
    setNewName("")
    setDialogOpen(false)
  }

  const removeSymbol = (symbol: string) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol))
  }

  return (
    <div className="w-full bg-card border-b border-border flex items-center overflow-hidden max-w-full">
      {/* Scrolling Ticker */}
      <div
        ref={scrollRef}
        className="overflow-x-auto flex-1 hover:cursor-grab active:cursor-grabbing scrollbar-hide"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex whitespace-nowrap py-1">
          {tickerData.map((data) => (
            <TickerItem key={data.symbol} data={data} />
          ))}
        </div>
      </div>
      {/* Fixed Controls - Right Side */}
      <div className="flex items-center shrink-0 px-2 border-l border-border bg-card z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add Symbol Form */}
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium">Add Symbol</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Symbol (e.g., AAPL)"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                  />
                  <Input
                    placeholder="Name (e.g., Apple)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(e.target.value as "index" | "stock")
                    }
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="stock">Stock</option>
                    <option value="index">Index</option>
                  </select>
                  <Button onClick={addSymbol} size="sm" className="ml-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Current Watchlist */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Symbols</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {watchlist.map((item) => (
                    <div
                      key={item.symbol}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {item.symbol}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSymbol(item.symbol)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
