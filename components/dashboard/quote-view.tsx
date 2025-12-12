"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react"
import Link from "next/link"
import { ReactGrid, Column, Row } from "@silevis/reactgrid"
import "@silevis/reactgrid/styles.css"
import { StockChart } from "@/components/dashboard/stock-chart"

interface QuoteData {
  symbol: string
  price: {
    regularMarketPrice: number
    regularMarketChange: number
    regularMarketChangePercent: number
    regularMarketOpen: number
    regularMarketDayHigh: number
    regularMarketDayLow: number
    regularMarketVolume: number
    marketCap: number
    exchangeName?: string
    longName?: string
    shortName?: string
    marketState?: string
    sector?: string
    industry?: string
  }
  summaryDetail: {
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    averageVolume: number
    dividendYield: number
    beta: number
    trailingPE: number
    sector?: string
    industry?: string
    longBusinessSummary?: string
  }
  defaultKeyStatistics: {
    enterpriseValue: number
    profitMargins: number
    trailingEps?: number
  }
  financialData?: {
    targetMeanPrice?: number
  }
}

interface QuoteViewProps {
  symbol: string
  showBackButton?: boolean
}

export function QuoteView({ symbol, showBackButton = true }: QuoteViewProps) {
  const router = useRouter()
  const [data, setData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [chartData, setChartData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartRange, setChartRange] = useState("1y")
  const [chartInterval, setChartInterval] = useState("1d")

  useEffect(() => {
    if (!symbol) return

    const fetchQuote = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/stocks/quote/${symbol}`)
        const json = await res.json()

        if (json.success && json.data) {
          setData(json.data)
        } else {
          setError(json.error || "Failed to fetch quote data")
        }
      } catch (err) {
        console.error(err)
        setError("An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [symbol])

  useEffect(() => {
    if (!symbol) return

    const fetchChart = async () => {
      try {
        setChartLoading(true)
        const res = await fetch(`/api/stocks/chart/${symbol}?range=${chartRange}&interval=${chartInterval}`)
        const json = await res.json()

        if (json.success && json.data) {
          // Handle both possible response structures
          const quotes = json.data.quotes || json.data
          if (Array.isArray(quotes)) {
            setChartData(quotes.map((item: any) => ({
               date: item.date,
               open: Number(item.open),
               high: Number(item.high),
               low: Number(item.low),
               close: Number(item.close),
               volume: Number(item.volume),
               // Format date for display (for ReactGrid)
               dateStr: new Date(item.date).toLocaleDateString(),
            })))
          }
        }
      } catch (err) {
        console.error("Chart fetch error:", err)
      } finally {
        setChartLoading(false)
      }
    }

    fetchChart()
  }, [symbol, chartRange, chartInterval])

  const handleRangeChange = (range: string, interval: string) => {
    setChartRange(range)
    setChartInterval(interval)
  }

  // Helper to format large numbers
  const formatNumber = (num: number) => {
    if (!num) return "N/A"
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(num)
  }

  // Helper to format currency
  const formatCurrency = (num: number) => {
    if (num === undefined || num === null) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  // Helper to format percent
  const formatPercent = (num: number) => {
    if (num === undefined || num === null) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  // ReactGrid generic columns setup
  const getColumns = (): Column[] => [
    { columnId: "date", width: 120 },
    { columnId: "open", width: 100 },
    { columnId: "high", width: 100 },
    { columnId: "low", width: 100 },
    { columnId: "close", width: 100 },
    { columnId: "volume", width: 120 }
  ];

  const headerRow: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "Date" },
      { type: "header", text: "Open" },
      { type: "header", text: "High" },
      { type: "header", text: "Low" },
      { type: "header", text: "Close" },
      { type: "header", text: "Volume" }
    ]
  };

  const getRows = (data: any[]): Row[] => {
    return [
      headerRow,
      ...data.slice(0, 50).map<Row>((item, idx) => ({
        rowId: idx,
        cells: [
          { type: "text", text: item.dateStr },
          { type: "number", value: item.open, format: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }) },
          { type: "number", value: item.high, format: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }) },
          { type: "number", value: item.low, format: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }) },
          { type: "number", value: item.close, format: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }) },
          { type: "number", value: item.volume }
        ]
      }))
    ];
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 p-6 flex-col">
        {showBackButton && (
            <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            </Link>
        )}
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <h3 className="text-lg font-bold">Error Loading Quote</h3>
              <p>{error || "Stock data not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const price = data.price || {}
  const summary = data.summaryDetail || {}
  
  const isPositive = price.regularMarketChange >= 0

  return (
    <div className="flex flex-1 flex-col p-4 lg:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
             
              <h1 className="text-3xl font-bold tracking-tight">{price.symbol || symbol}</h1>
              <Badge variant="outline" className="text-xs">{price.exchangeName || "US"}</Badge>
            </div>
            <p className="text-muted-foreground ml-11">{price.longName || price.shortName || symbol}</p>
          </div>

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day Range</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(price.regularMarketDayLow)} - {formatNumber(price.regularMarketDayHigh)}
              </div>
              <p className="text-xs text-muted-foreground">Open: {formatCurrency(price.regularMarketOpen)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">52 Week Range</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(summary.fiftyTwoWeekLow)} - {formatNumber(summary.fiftyTwoWeekHigh)}
              </div>
              <p className="text-xs text-muted-foreground">Yearly fluctuation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(price.marketCap)}</div>
              <p className="text-xs text-muted-foreground">Analyst Rating: {data.financialData?.targetMeanPrice ? formatCurrency(data.financialData.targetMeanPrice) : 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(price.regularMarketVolume)}</div>
              <p className="text-xs text-muted-foreground">Avg: {formatNumber(summary.averageVolume)}</p>
            </CardContent>
          </Card>
        </div>
          <div className="flex items-end flex-col bg-card p-4 rounded-xl border border-border shadow-sm">
             <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{formatCurrency(price.regularMarketPrice)}</span>
             </div>
             <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{isPositive ? '+' : ''}{formatCurrency(price.regularMarketChange)}</span>
                <span>({formatPercent(price.regularMarketChangePercent)})</span>
             </div>
             <span className="text-xs text-muted-foreground mt-1">
               {price.marketState} • {new Date().toLocaleTimeString()}
             </span>
          </div>
        </div>

        {/* Price Chart (Lightweight Charts) */}
        <Card>
          <CardHeader>
             <CardTitle>Historical Price & Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <StockChart data={chartData} symbol={symbol} onRangeChange={handleRangeChange} />
            )}
          </CardContent>
        </Card>

        {/* Key Stats Grid */}
        

        {/* SEC Filings Link */}
         {/* <Card>
            <CardHeader>
                <CardTitle>SEC Filings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        View official SEC filings for {symbol} including 10-K, 10-Q, 8-K reports and ownership forms.
                    </p>
                    <div className="flex gap-2">
                        <Link href={`/api/stocks/filings/${symbol}`} target="_blank">
                            <Button variant="outline" size="sm">
                                View JSON Data
                            </Button>
                        </Link>
                        <Link href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&ticker=${symbol}&type=&dateb=&owner=exclude&count=40`} target="_blank">
                            <Button variant="outline" size="sm">
                                View on SEC.gov
                            </Button>
                        </Link>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: Some companies may not have SEC filings or use different ticker symbols for SEC reporting.
                    </p>
                </div>
            </CardContent>
         </Card> */}

      </div>
    </div>
  )
}
