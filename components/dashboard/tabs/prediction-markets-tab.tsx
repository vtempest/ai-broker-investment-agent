"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TrendingUp, ExternalLink, Loader2, DollarSign, Activity, Clock, RefreshCw, Filter, Search } from "lucide-react"
import { MarketDebate } from "@/components/dashboard/analysis/market-debate"
import { Input } from "@/components/ui/input"

interface PolymarketMarket {
  id: string
  question: string
  slug: string
  eventSlug?: string
  volume24hr: number
  volumeTotal: number
  active: boolean
  closed: boolean
  outcomes: string[]
  outcomePrices: string[]
  image?: string
  description?: string
  endDate?: string
  tags?: string[]
}

export function PredictionMarketsTab() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [limit, setLimit] = useState(50)
  const [timeWindow, setTimeWindow] = useState('24h')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [hideHighProb, setHideHighProb] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMarkets()
  }, [limit, timeWindow, selectedCategory, searchTerm])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && markets.length >= limit) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loading, loadingMore, markets.length, limit])

  const loadMore = useCallback(() => {
    if (!loadingMore && markets.length >= limit) {
      setLoadingMore(true)
      setLimit(prev => prev + 20)
    }
  }, [loadingMore, markets.length, limit])

  useEffect(() => {
    // Extract unique categories from markets
    const categories = new Set<string>()
    markets.forEach(market => {
      if (market.tags) {
        market.tags.forEach(tag => categories.add(tag))
      }
    })
    setAvailableCategories(Array.from(categories).sort())
  }, [markets])

  const fetchMarkets = async (sync = false) => {
    try {
      setLoading(true)
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
      const syncParam = sync ? '&sync=true' : ''
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
      const response = await fetch(`/api/polymarket/markets?limit=${limit}&window=${timeWindow}${categoryParam}${syncParam}${searchParam}`)
      const data = await response.json()

      if (data.success) {
        setMarkets(data.markets)
      }
    } catch (error) {
      console.error('Error fetching markets:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const syncMarkets = async () => {
    try {
      setSyncing(true)
      await fetchMarkets(true)
    } finally {
      setSyncing(false)
    }
  }

  const syncAllMarkets = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/polymarket/markets/sync-all', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        await fetchMarkets()
      }
    } catch (error) {
      console.error('Error syncing all markets:', error)
    } finally {
      setSyncing(false)
    }
  }

  const formatVolume = (volume: number | undefined | null) => {
    if (!volume || isNaN(volume)) return "$0"
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`
    return `$${volume.toFixed(0)}`
  }

  const filteredMarkets = markets.filter(market => {
    if (!hideHighProb) return true
    // Check if any outcome is > 95%
    if (!market.outcomePrices) return true
    return !market.outcomePrices.some(price => parseFloat(price) > 0.95)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading prediction markets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Most Traded Prediction Markets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Live from Polymarket • {filteredMarkets.length} active markets
              {searchTerm && (
                <span className="ml-2 text-primary font-medium">
                  • Searching for "{searchTerm}"
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncMarkets}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Data
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={syncAllMarkets}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All Markets
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              variant={timeWindow === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('24h')}
            >
              24h Volume
            </Button>
            <Button
              variant={timeWindow === 'total' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('total')}
            >
              Total Volume
            </Button>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets... (Press Enter to search)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchTerm(searchQuery)
                }
              }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border">
            <Checkbox
              id="hide-probs"
              checked={hideHighProb}
              onCheckedChange={(checked) => setHideHighProb(checked as boolean)}
            />
            <Label htmlFor="hide-probs" className="text-sm font-medium cursor-pointer">
              Hide &gt; 95%
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      {/* Markets Grid */}
      <div className="grid gap-4">
        {filteredMarkets.map((market, index) => (
          <Card key={market.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Market Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  {market.image && (
                    <img
                      src={market.image}
                      alt={market.question}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  {/* Highest Odds Outcome Card */}
                  {market.outcomes && market.outcomePrices && (() => {
                    const highestIdx = market.outcomePrices.reduce((maxIdx, price, idx) =>
                      parseFloat(price) > parseFloat(market.outcomePrices[maxIdx]) ? idx : maxIdx
                    , 0)
                    const outcome = market.outcomes[highestIdx]
                    const percentage = parseFloat(market.outcomePrices[highestIdx]) * 100
                    const isYes = outcome.toLowerCase() === 'yes'
                    const isNo = outcome.toLowerCase() === 'no'

                    return (
                      <div
                        className={`px-2 py-1.5 rounded border flex-shrink-0 ${isYes
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                          : isNo
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                            : 'bg-muted border-border'
                          }`}
                      >
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {outcome}
                        </div>
                        <div className={`text-lg font-bold leading-tight ${isYes
                          ? 'text-green-600 dark:text-green-400'
                          : isNo
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-primary'
                          }`}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold leading-tight">{market.question}</h3>
                      <Badge variant="outline" className="flex-shrink-0">
                        #{index + 1}
                      </Badge>
                    </div>

                    {market.tags && market.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {market.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Polymarket Embed */}
                <div className="mb-4 rounded-lg overflow-hidden border border-border bg-background">
                  <iframe
                    src={`https://embed.polymarket.com/market.html?market=${market.slug}&features=volume,chart&theme=dark`}
                    width="100%"
                    height="330"
                    className="w-full dark:[color-scheme:dark] light:[color-scheme:light]"
                    style={{ border: 'none' }}
                    loading="lazy"
                  />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" />
                      24h Volume
                    </div>
                    <div className="text-lg font-bold">{formatVolume(market.volume24hr)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      Total Volume
                    </div>
                    <div className="text-lg font-bold">{formatVolume(market.volumeTotal)}</div>
                  </div>

                  {market.endDate && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        Ends
                      </div>
                      <div className="text-sm font-semibold">
                        {new Date(market.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Debate Analysis */}
                <div className="mt-4">
                  <MarketDebate
                    marketId={market.id}
                    question={market.question}
                    currentYesPrice={market.outcomePrices && market.outcomePrices[0] ? parseFloat(market.outcomePrices[0]) : 0.5}
                    currentNoPrice={market.outcomePrices && market.outcomePrices[1] ? parseFloat(market.outcomePrices[1]) : 0.5}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:w-48 flex lg:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(
                    market.eventSlug
                      ? `https://polymarket.com/event/${market.eventSlug}/${market.slug}`
                      : `https://polymarket.com/event/${market.slug}`,
                    '_blank'
                  )}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Polymarket
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading more markets...</span>
          </div>
        )}
      </div>

      {markets.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Markets Found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? `No markets found matching "${searchTerm}". Try a different search term.`
              : 'Unable to load prediction markets at this time.'}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSearchTerm('')
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
