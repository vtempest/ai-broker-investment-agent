"use client"

import { useState, useEffect } from "react"
import { QuoteView } from "@/components/dashboard/quote-view"
import { StockSearch } from "@/components/dashboard/stock-search"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { demoStrategies, Strategy } from "@/lib/demo-data"
import { Play, Pause, Settings, TrendingUp, Activity, ChevronDown, ChevronUp } from "lucide-react"

interface BacktestResult {
  strategyName: string
  strategyId: string
  finalValue: number
  totalReturn: number
  totalReturnPercent: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  sharpeRatio?: number
  maxDrawdown: number
}

export function StrategiesTab() {
  const [strategies, setStrategies] = useState<Strategy[]>(demoStrategies)
  const [sortOption, setSortOption] = useState<'likes' | 'name' | 'pnl'>('likes')
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null)
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null)
  const [showAllStrategies, setShowAllStrategies] = useState(true)
  const [backtestParams, setBacktestParams] = useState({
    symbol: 'AAPL',
    startDate: '2022-01-01',
    endDate: '2024-12-01',
    initialCapital: 100000,
  })
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [isBacktesting, setIsBacktesting] = useState(false)
  const [backtestError, setBacktestError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlgoScripts = async () => {
      try {
        const response = await fetch('/api/strategies/algo-scripts')
        if (response.ok) {
          const scripts = await response.json()
          const newStrategies: Strategy[] = scripts.map((script: any) => ({
            id: script.url || Math.random().toString(36).substring(7),
            name: script.name || 'Unnamed Strategy',
            description: '', // Description is not loaded initially
            todayPnL: 0,
            last7DaysPnL: 0,
            last30DaysPnL: 0,
            winRate: 0, 
            activeMarkets: 0,
            tradesToday: 0,
            status: 'paper',
            timeframe: 'Variable',
            riskLevel: 'medium',
            bestConditions: 'N/A',
            avoidWhen: 'N/A',
            likes: script.likes || 0,
            author: script.author || 'Unknown',
            created: script.created || '',
            updated: script.updated || '',
            script_type: script.script_type || 'strategy',
          }))
          
          setStrategies(prev => {
            const existingIds = new Set(prev.map(s => s.id))
            const uniqueNewStrategies = newStrategies.filter(s => !existingIds.has(s.id))
            return [ ...uniqueNewStrategies, ...prev]
          })
        }
      } catch (error) {
        console.error("Failed to fetch algo scripts", error)
      }
    }

    fetchAlgoScripts()
  }, [])

  const handleExpandStrategy = async (strategyId: string) => {
    if (expandedStrategyId === strategyId) {
      setExpandedStrategyId(null)
      return
    }

    // If description/source is missing, fetch it
    const strategy = strategies.find(s => s.id === strategyId)
    if (strategy && (!strategy.description || !strategy.source) && !strategy.id.startsWith('demo-')) { // Assuming demo IDs don't match algo URLs
       setLoadingDetails(strategyId)
       try {
           const response = await fetch(`/api/strategies/algo-scripts?id=${strategyId}`)
           if (response.ok) {
               const details = await response.json()
               setStrategies(prev => prev.map(s => {
                   if (s.id === strategyId) {
                       return {
                           ...s,
                           description: details.description,
                           source: details.source,
                           winRate: details.description?.includes('Win Rate') ? parseFloat(details.description.match(/Win Rate\s*[|:]\s*([\d.]+)%?/)?.[1] || '0') : s.winRate
                       }
                   }
                   return s
               }))
           }
       } catch (error) {
           console.error("Failed to fetch strategy details", error)
       } finally {
           setLoadingDetails(null)
       }
    }
    setExpandedStrategyId(strategyId)
  }

  const sortedStrategies = [...strategies].sort((a, b) => {
      if (sortOption === 'likes') {
          return (b.likes || 0) - (a.likes || 0)
      } else if (sortOption === 'name') {
          return a.name.localeCompare(b.name)
      } else {
          return b.last30DaysPnL - a.last30DaysPnL
      }
  })

  // Filter based on showAllStrategies if needed, but for now we just show limited count if not showAll
  const displayedStrategies = showAllStrategies ? sortedStrategies : sortedStrategies.slice(0, 6)

  const handleStrategyToggle = (strategyId: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStrategies.length === strategies.length) {
      setSelectedStrategies([])
    } else {
      setSelectedStrategies(strategies.map(s => s.id))
    }
  }

  const runBacktest = async () => {
    if (selectedStrategies.length === 0) {
      setBacktestError('Please select at least one strategy')
      return
    }

    setIsBacktesting(true)
    setBacktestError(null)

    try {
      const response = await fetch('/api/backtest-technical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: backtestParams.symbol,
          startDate: backtestParams.startDate,
          endDate: backtestParams.endDate,
          initialCapital: backtestParams.initialCapital,
          strategyIds: selectedStrategies,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setBacktestResults(data.results)
      } else {
        setBacktestError(data.error || 'Backtest failed')
      }
    } catch (error: any) {
      setBacktestError(error.message || 'Failed to run backtest')
    } finally {
      setIsBacktesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* <h2 className="text-2xl font-bold">Trading Strategies ({strategies.length})</h2> */}
        
      </div>

        <Card className="p-6">
        

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <StockSearch
                value={backtestParams.symbol}
                onChange={(val) => setBacktestParams({ ...backtestParams, symbol: val.toUpperCase() })}
                onSelect={(val) => setBacktestParams({ ...backtestParams, symbol: val })} // Ensure generic update
                placeholder="Search Symbol (e.g. AAPL)"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={backtestParams.startDate}
                onChange={(e) => setBacktestParams({ ...backtestParams, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={backtestParams.endDate}
                onChange={(e) => setBacktestParams({ ...backtestParams, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="capital">Initial Capital</Label>
              <Input
                id="capital"
                type="number"
                value={backtestParams.initialCapital}
                onChange={(e) => setBacktestParams({ ...backtestParams, initialCapital: parseInt(e.target.value) })}
              />
            </div>
          </div>

          
        {/* QuoteView Section */}
        <div className="mb-6 border rounded-lg overflow-hidden bg-background">
             <QuoteView symbol={backtestParams.symbol} showBackButton={false} />
        </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Select Strategies to Backtest</Label>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 max-h-60 overflow-y-auto border rounded-lg p-4">
              {strategies
                .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                .map((strategy) => (
                  <div
                    key={strategy.id}
                    className={`flex items-center space-x-2 ${
                      !selectedStrategies.includes(strategy.id) ? 'hidden' : ''
                    }`}
                  >
                    <Checkbox
                      id={`strategy-${strategy.id}`}
                      checked={selectedStrategies.includes(strategy.id)}
                      onCheckedChange={() => handleStrategyToggle(strategy.id)}
                    />
                    <label
                      htmlFor={`strategy-${strategy.id}`}
                      className="flex flex-col space-y-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <span>{strategy.name}</span>
                    </label>
                  </div>
                ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {selectedStrategies.length} strateg{selectedStrategies.length === 1 ? 'y' : 'ies'} selected
            </div>
          </div>

          {backtestError && (
            <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 dark:text-red-400">
              {backtestError}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={runBacktest} disabled={isBacktesting} size="lg">
              {isBacktesting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>

          {backtestResults.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Backtest Results - {backtestParams.symbol}</h3>
              <div className="text-sm text-muted-foreground mb-4">
                Period: {backtestParams.startDate} to {backtestParams.endDate} | Initial Capital: ${backtestParams.initialCapital.toLocaleString()}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {backtestResults.map((result, index) => (
                  <div key={result.strategyId} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{index + 1}. {result.strategyName}</div>
                        <Badge variant={result.totalReturnPercent >= 0 ? 'default' : 'destructive'}>
                          {result.totalReturnPercent >= 0 ? '+' : ''}{result.totalReturnPercent.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Trades: {result.totalTrades} | Win Rate: {result.winRate.toFixed(1)}% |
                        {result.sharpeRatio && ` Sharpe: ${result.sharpeRatio.toFixed(2)} |`} Max DD: {result.maxDrawdown.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${result.totalReturnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${result.finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs ${result.totalReturnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {result.totalReturnPercent >= 0 ? '+' : ''}${result.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

<div className="flex gap-2">
            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v as any)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    {/* <SelectItem value="pnl">Highest PnL (30D)</SelectItem> */}
                    <SelectItem value="name">Name</SelectItem>
                </SelectContent>
            </Select>

             <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedStrategies.length === strategies.length ? 'Deselect All' : 'Select All'}
              </Button>

           
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedStrategies.map((strategy) => (
          <Card key={strategy.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => handleExpandStrategy(strategy.id)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    {strategy.likes !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                            ❤️ {strategy.likes}
                        </Badge>
                    )}

                <span className="font-bold text-xs">{strategy.author || 'N/A'}</span>
                <span className="font-semibold text-xs">{ new Date(strategy.created || "")?.toLocaleDateString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})
 }</span>

                </div>
                 <h3 className="line-clamp-1 text-lg font-bold mb-1">{strategy.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                  
                  <Checkbox
                    id={`card-checkbox-${strategy.id}`}
                    checked={selectedStrategies.includes(strategy.id)}
                    onCheckedChange={(checked) => {
                        handleStrategyToggle(strategy.id)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 h-5 w-5"
                  />
              </div>
            </div>

            {expandedStrategyId === strategy.id ? (
                <div className="mb-4 text-sm">
                    {loadingDetails === strategy.id ? (
                        <div className="flex items-center text-muted-foreground animate-pulse">
                            Loading details...
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto pr-2">
                            <p className="whitespace-pre-wrap mb-4 text-muted-foreground text-xs">{strategy.description}</p>
                            {strategy.source && (
                                <div className="bg-muted p-2 rounded-md overflow-x-auto">
                                    <pre className="text-xs font-mono">{strategy.source}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground mb-3 italic">Click to view details</p>
            )}
            
            <div className="flex justify-end pt-2">
               <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
