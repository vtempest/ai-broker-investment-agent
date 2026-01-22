"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TrendingUp, TrendingDown, Plus, X, Settings, CalendarDays, Calendar, Play, Pause } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import { cleanCompanyName } from "@/packages/investing/src/stocks/stock-names"

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  monthlyChange: number
  monthlyChangePercent: number
  yearlyChange: number
  yearlyChangePercent: number
  high: number
  low: number
  volume: string
  type: "index" | "stock"
  source?: string
}

function getStockLogoUrl(symbol: string): string {
  return `https://img.logo.dev/ticker/${symbol.replace("^", "")}?token=pk_TttrZhYwSReZxFePkXo-Bg&size=48&retina=true`
}

const showPercentSign = false;

const defaultWatchlist = [
  // Major Indexes (Yahoo Finance requires ^ prefix for indices)
  { symbol: "^GSPC", name: "S&P 500", type: "index" as const },
  { symbol: "BTC-USD", name: "Bitcoin", type: "stock" as const },
  { symbol: "ETH-USD", name: "Ethereum", type: "stock" as const },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" as const },
  { symbol: "MSFT", name: "Microsoft", type: "stock" as const },
  { symbol: "GOOGL", name: "Alphabet", type: "stock" as const },
  { symbol: "AMZN", name: "Amazon", type: "stock" as const },
  { symbol: "NVDA", name: "NVIDIA", type: "stock" as const },
  { symbol: "TSLA", name: "Tesla", type: "stock" as const },
  { symbol: "META", name: "Meta Platforms", type: "stock" as const },
  { symbol: "JPM", name: "JPMorgan Chase", type: "stock" as const },
  { symbol: "V", name: "Visa Inc.", type: "stock" as const },
  { symbol: "SNDK", name: "SanDisk", type: "stock" as const },
  { symbol: "WMT", name: "Walmart", type: "stock" as const },
  { symbol: "UNH", name: "UnitedHealth", type: "stock" as const },
  { symbol: "HD", name: "Home Depot", type: "stock" as const },
  { symbol: "PG", name: "Procter & Gamble", type: "stock" as const },
  { symbol: "XOM", name: "Exxon Mobil", type: "stock" as const },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "stock" as const },
  { symbol: "BAC", name: "Bank of America", type: "stock" as const },
  { symbol: "KO", name: "Coca-Cola", type: "stock" as const },
  { symbol: "DIS", name: "Walt Disney", type: "stock" as const },
  { symbol: "NFLX", name: "Netflix", type: "stock" as const },

  { symbol: "^DJI", name: "Dow Jones", type: "index" as const },
  { symbol: "^IXIC", name: "NASDAQ", type: "index" as const },
  { symbol: "^VIX", name: "Volatility Index", type: "index" as const },
  // Crypto
  // Commodities
  { symbol: "GC=F", name: "Gold", type: "index" as const },
  { symbol: "CL=F", name: "Crude Oil", type: "index" as const },
]

async function fetchTickerData(symbols: string[]): Promise<TickerData[]> {
  try {
    const response = await fetch(`/api/stocks/quotes?symbols=${symbols.join(",")}`)
    const result = await response.json()

    if (!result.success || !result.data) {
      console.error("Failed to fetch ticker data:", result.error)
      return []
    }

    return result.data.map((quote: any) => {
      const price = quote.regularMarketPrice || 0
      const change = quote.regularMarketChange || 0
      const changePercent = quote.regularMarketChangePercent || 0

      // Use real monthly and yearly change from API (calculated from historical data)
      const monthlyChange = quote.monthlyChange || 0
      const monthlyChangePercent = quote.monthlyChangePercent || 0
      const yearlyChange = quote.yearlyChange || 0
      const yearlyChangePercent = quote.yearlyChangePercent || 0

      return {
        symbol: quote.symbol || "N/A",
        name: quote.shortName || quote.longName || "Unknown",
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        monthlyChange: Number(monthlyChange.toFixed(2)),
        monthlyChangePercent: monthlyChangePercent, // Already rounded from API
        yearlyChange: Number(yearlyChange.toFixed(2)),
        yearlyChangePercent: yearlyChangePercent, // Already rounded from API
        high: quote.regularMarketDayHigh || price,
        low: quote.regularMarketDayLow || price,
        volume: quote.regularMarketVolume
          ? quote.regularMarketVolume >= 1e9
            ? `${(quote.regularMarketVolume / 1e9).toFixed(1)}B`
            : `${(quote.regularMarketVolume / 1e6).toFixed(1)}M`
          : "N/A",
        type: quote.symbol?.startsWith("^") ? "index" : "stock",
        source: quote.source,
      }
    })
  } catch (error) {
    console.error("Error fetching ticker data:", error)
    return []
  }
}

function TickerItem({ data }: { data: TickerData }) {
  const router = useRouter()
  const isDailyPositive = data.change >= 0
  const isMonthlyPositive = data.monthlyChange >= 0
  const isYearlyPositive = data.yearlyChange >= 0

  const handleClick = () => {
    router.push(`/dashboard?symbol=${data.symbol}`)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className="flex items-center font-mono gap-2 px-3 py-1 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
          >
            <Image
              src={getStockLogoUrl(data.symbol) || "/placeholder.svg"}
              alt={data.symbol}
              width={24}
              height={24}
              className="rounded-sm"
              unoptimized
            />
            {/* <span className="font-semibold text-foreground">{data.symbol}</span> */}
            <span className="font-medium text-foreground">{cleanCompanyName(data.name)}</span>
            {/* <span className="font-mono text-foreground">
              ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span> */}
            <div
              className={cn(
                "flex font-bold items-center gap-1 text-sm",
                isDailyPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {isDailyPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="font-mono tabular-nums">
                {Math.round(data.changePercent)}{showPercentSign ? "%" : ""}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 font-semibold text-sm",
                isMonthlyPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              <CalendarDays className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono tabular-nums">
                {Math.round(data.monthlyChangePercent)}{showPercentSign ? "%" : ""}
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 font-semibold text-sm",
                isYearlyPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              <Calendar className="h-3 w-3 text-muted-foreground" />

              {/* <span className="text-muted-foreground text-xs">Y:</span> */}
              <span className="font-mono tabular-nums">
                {Math.round(data.yearlyChangePercent)}{showPercentSign ? "%" : ""}
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
              <span className="text-muted-foreground">Price:</span>
              <span className="font-mono">${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-muted-foreground">Daily Change:</span>
              <span className={cn("font-mono", isDailyPositive ? "text-emerald-500" : "text-red-500")}>
                {isDailyPositive ? "+" : ""}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
              </span>
              <span className="text-muted-foreground">Monthly Change:</span>
              <span className={cn("font-mono", isMonthlyPositive ? "text-emerald-500" : "text-red-500")}>
                {isMonthlyPositive ? "+" : ""}{data.monthlyChange.toFixed(2)} ({data.monthlyChangePercent.toFixed(0)}%)
              </span>
              <span className="text-muted-foreground">Yearly Change:</span>
              <span className={cn("font-mono", isYearlyPositive ? "text-emerald-500" : "text-red-500")}>
                {isYearlyPositive ? "+" : ""}{data.yearlyChange.toFixed(2)} ({data.yearlyChangePercent.toFixed(0)}%)
              </span>
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono">${data.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono">${data.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {/* <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono">{data.volume}</span> */}
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const batchLoadRef = useRef<NodeJS.Timeout | null>(null)
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0)

  const BATCH_SIZE = 5 // Load 5 symbols at a time
  const BATCH_DELAY = 20000 // 20 seconds between batches

  const updateTickerDataInBatches = useCallback(async () => {
    const symbols = watchlist.map((item) => item.symbol)
    const totalBatches = Math.ceil(symbols.length / BATCH_SIZE)

    // Reset ticker data when starting fresh
    setTickerData([])
    setCurrentBatchIndex(0)

    const loadBatch = async (batchIndex: number) => {
      const startIdx = batchIndex * BATCH_SIZE
      const endIdx = Math.min(startIdx + BATCH_SIZE, symbols.length)
      const batchSymbols = symbols.slice(startIdx, endIdx)

      if (batchSymbols.length > 0) {
        const data = await fetchTickerData(batchSymbols)
        if (data.length > 0) {
          setTickerData((prev) => [...prev, ...data])
        }
      }

      // Schedule next batch if there are more
      const nextBatchIndex = (batchIndex + 1) % totalBatches
      setCurrentBatchIndex(nextBatchIndex)

      if (batchLoadRef.current) {
        clearTimeout(batchLoadRef.current)
      }

      // If we've completed all batches, wait before starting over
      // Otherwise, wait the delay before loading the next batch
      batchLoadRef.current = setTimeout(() => {
        if (nextBatchIndex === 0) {
          // Starting over - reload all batches
          setTickerData([])
        }
        loadBatch(nextBatchIndex)
      }, BATCH_DELAY)
    }

    // Start loading the first batch
    loadBatch(0)
  }, [watchlist])

  const updateTickerData = useCallback(async () => {
    const symbols = watchlist.map((item) => item.symbol)
    const data = await fetchTickerData(symbols)
    if (data.length > 0) {
      setTickerData(data)
    }
  }, [watchlist])

  useEffect(() => {
    // Start batched loading on mount
    updateTickerDataInBatches()

    return () => {
      // Cleanup batch loading timeout
      if (batchLoadRef.current) {
        clearTimeout(batchLoadRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [updateTickerDataInBatches])

  // Pause/Resume batch loading
  useEffect(() => {
    if (isPaused && batchLoadRef.current) {
      clearTimeout(batchLoadRef.current)
    } else if (!isPaused) {
      // Resume batch loading when unpaused
      updateTickerDataInBatches()
    }
  }, [isPaused, updateTickerDataInBatches])

  // Auto-scroll effect with seamless loop
  useEffect(() => {
    if (isHovered || isPaused || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    const scrollSpeed = 0.5

    const autoScroll = setInterval(() => {
      // When we reach halfway, reset to the beginning for seamless loop
      const halfWidth = scrollContainer.scrollWidth / 2

      if (scrollContainer.scrollLeft >= halfWidth) {
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft += scrollSpeed
      }
    }, 16)

    return () => clearInterval(autoScroll)
  }, [isHovered, isPaused, tickerData])

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
        <div className="flex whitespace-nowrap py-0">
          {/* Render items twice for seamless infinite loop */}
          {tickerData.map((data, index) => (
            <TickerItem key={`first-${data.symbol}-${index}`} data={data} />
          ))}
          {tickerData.map((data, index) => (
            <TickerItem key={`second-${data.symbol}-${index}`} data={data} />
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
