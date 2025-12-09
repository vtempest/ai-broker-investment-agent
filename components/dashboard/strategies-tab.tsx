"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { demoStrategies } from "@/lib/demo-data"
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
  const [strategies] = useState(demoStrategies)
  const [showAllStrategies, setShowAllStrategies] = useState(false)
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

  const displayedStrategies = showAllStrategies ? strategies : strategies.slice(0, 6)

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
        <h2 className="text-2xl font-bold">Trading Strategies ({strategies.length})</h2>
        <Button
          variant="outline"
          onClick={() => setShowAllStrategies(!showAllStrategies)}
        >
          {showAllStrategies ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show All {strategies.length} Strategies
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedStrategies.map((strategy) => (
          <Card key={strategy.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{strategy.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{strategy.description}</p>
              </div>
              <Badge
                variant={
                  strategy.status === 'running' ? 'default' :
                  strategy.status === 'paused' ? 'secondary' : 'outline'
                }
                className="ml-2"
              >
                {strategy.status === 'running' ? <Play className="h-3 w-3 mr-1" /> :
                 strategy.status === 'paused' ? <Pause className="h-3 w-3 mr-1" /> : null}
                {strategy.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Today</div>
                <div className={`text-sm font-bold ${strategy.todayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {strategy.todayPnL >= 0 ? '+' : ''}${Math.abs(strategy.todayPnL).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">7D</div>
                <div className={`text-sm font-bold ${strategy.last7DaysPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {strategy.last7DaysPnL >= 0 ? '+' : ''}${Math.abs(strategy.last7DaysPnL).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">30D</div>
                <div className={`text-sm font-bold ${strategy.last30DaysPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {strategy.last30DaysPnL >= 0 ? '+' : ''}${Math.abs(strategy.last30DaysPnL).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-semibold">{strategy.winRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Timeframe</span>
                <span className="font-semibold">{strategy.timeframe}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Risk Level</span>
                <Badge variant={strategy.riskLevel === 'high' ? 'destructive' : strategy.riskLevel === 'medium' ? 'default' : 'secondary'} className="text-xs">
                  {strategy.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="sm" variant={strategy.status === 'running' ? 'secondary' : 'default'}>
                {strategy.status === 'running' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {strategy.status === 'running' ? 'Pause' : 'Start'}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!showAllStrategies && strategies.length > 6 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing 6 of {strategies.length} strategies
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Backtesting Workspace</h2>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={backtestParams.symbol}
                onChange={(e) => setBacktestParams({ ...backtestParams, symbol: e.target.value.toUpperCase() })}
                placeholder="AAPL"
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Select Strategies to Backtest</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedStrategies.length === strategies.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 max-h-60 overflow-y-auto border rounded-lg p-4">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`strategy-${strategy.id}`}
                    checked={selectedStrategies.includes(strategy.id)}
                    onCheckedChange={() => handleStrategyToggle(strategy.id)}
                  />
                  <label
                    htmlFor={`strategy-${strategy.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {strategy.name}
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
    </div>
  )
}
