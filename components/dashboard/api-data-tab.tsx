"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Brain,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  DollarSign
} from "lucide-react"
import {
  stockAgentsAPI,
  TOP_STOCKS,
  NewsResearcherAnalysisResponse,
  DebateAnalystAnalysisResponse,
  BacktestResponse
} from "@/lib/api/stock-agents-api"
import { MarkdownRenderer } from "@/components/dashboard/markdown-renderer"

export function ApiDataTab() {
  const [selectedStockList, setSelectedStockList] = useState<keyof typeof TOP_STOCKS>('mag7')
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<'news-researcher' | 'debate-analyst'>('news-researcher')
  const [activeTab, setActiveTab] = useState("quote")

  // Analysis data
  const [newsResearcherData, setNewsResearcherData] = useState<NewsResearcherAnalysisResponse | null>(null)
  const [debateAnalystData, setDebateAnalystData] = useState<DebateAnalystAnalysisResponse | null>(null)
  const [backtestData, setBacktestData] = useState<BacktestResponse | null>(null)
  const [healthData, setHealthData] = useState<any>(null)
  const [historyLogs, setHistoryLogs] = useState<any[]>([])

  // Quote and chart data
  const [quoteData, setQuoteData] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loadingQuote, setLoadingQuote] = useState(false)

  // Get stocks for selected list
  const stocks = TOP_STOCKS[selectedStockList]

  // Set initial stock when list changes
  useEffect(() => {
    if (stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0])
    }
  }, [selectedStockList, stocks, selectedStock])

  // Load health status on mount
  useEffect(() => {
    loadHealthStatus()
  }, [])

  // Load history on mount
  useEffect(() => {
    fetchHistory()
  }, [])

  // Load quote data when stock changes
  useEffect(() => {
    if (selectedStock) {
      fetchQuoteAndHistorical()
    }
  }, [selectedStock])

  const fetchQuoteAndHistorical = async () => {
    if (!selectedStock) return

    setLoadingQuote(true)
    try {
      // Fetch both quote and historical data in parallel
      const [quoteResponse, historicalResponse] = await Promise.all([
        fetch(`/api/stocks/quote/${selectedStock}`),
        fetch(`/api/stocks/historical/${selectedStock}?range=3mo&interval=1d`)
      ])

      if (quoteResponse.ok) {
        const quoteResult = await quoteResponse.json()
        setQuoteData(quoteResult.data)
      }

      if (historicalResponse.ok) {
        const historicalResult = await historicalResponse.json()
        // Transform data for lightweight-charts format
        const chartData = historicalResult.data.map((item: any) => ({
          time: new Date(item.date).getTime() / 1000, // Convert to Unix timestamp
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          value: item.volume
        })).filter((item: any) =>
          item.open !== null &&
          item.high !== null &&
          item.low !== null &&
          item.close !== null
        )
        setHistoricalData(chartData)
      }
    } catch (error) {
      console.error('Failed to fetch quote/historical data:', error)
    } finally {
      setLoadingQuote(false)
    }
  }

  const loadHealthStatus = async () => {
    try {
      const health = await stockAgentsAPI.getHealth()
      setHealthData(health)
    } catch (error) {
      console.error('Failed to load health status:', error)
    }
  }

  const analyzeWithNewsResearcher = async () => {
    if (!selectedStock) return

    setLoading(true)
    try {
      const result = await stockAgentsAPI.analyzeWithNewsResearcher({
        symbols: [selectedStock]
      })
      setNewsResearcherData(result)
    } catch (error) {
      console.error('News Researcher analysis failed:', error)
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWithDebateAnalyst = async () => {
    if (!selectedStock) return

    setLoading(true)
    try {
      const result = await stockAgentsAPI.analyzeWithDebateAnalyst({
        symbol: selectedStock
      })
      setDebateAnalystData(result)
    } catch (error) {
      console.error('Debate Analyst analysis failed:', error)
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const runBacktest = async () => {
    if (!selectedStock) return

    setLoading(true)
    try {
      const result = await stockAgentsAPI.runBacktest({
        symbol: selectedStock
      })
      setBacktestData(result)
    } catch (error) {
      console.error('Backtest failed:', error)
      alert(`Backtest failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const logs = await stockAgentsAPI.getAgentLogs()
      setHistoryLogs(logs)
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setError(`Failed to fetch history: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const getDecisionBadge = (decision: string) => {
    const colors = {
      BUY: 'bg-green-500 hover:bg-green-600',
      SELL: 'bg-red-500 hover:bg-red-600',
      HOLD: 'bg-yellow-500 hover:bg-yellow-600'
    }
    return (
      <Badge className={`${colors[decision as keyof typeof colors]} text-white`}>
        {decision}
      </Badge>
    )
  }

  const getServiceStatusBadge = (status: string) => {
    if (status === 'online') {
      return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Online</Badge>
    } else if (status === 'offline') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Offline</Badge>
    } else {
      return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Agent API Data & Analysis</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get real-time analysis and backtesting data from AI agents
            </p>
          </div>
          <Button onClick={loadHealthStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>


        {/* Stock Selection */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Stock List</label>
            <Select value={selectedStockList} onValueChange={(value) => setSelectedStockList(value as keyof typeof TOP_STOCKS)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mag7">Magnificent 7</SelectItem>
                <SelectItem value="sp500Top">S&P 500 Top 10</SelectItem>
                <SelectItem value="tech">Top Tech Stocks</SelectItem>
                <SelectItem value="faang">FAANG</SelectItem>
                <SelectItem value="mostActive">Most Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Stock</label>
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock} value={stock}>
                    {stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Agent</label>
            <Select value={activeAgent} onValueChange={(value) => setActiveAgent(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debate-analyst">Debate Analyst</SelectItem>
                <SelectItem value="news-researcher">News Researcher</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={activeAgent === 'news-researcher' ? analyzeWithNewsResearcher : analyzeWithDebateAnalyst}
            disabled={!selectedStock || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze with {activeAgent === 'news-researcher' ? 'News Researcher' : 'Debate Analyst'}
              </>
            )}
          </Button>
          <Button
            onClick={runBacktest}
            disabled={!selectedStock || loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Run Backtest
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {/* <TabsTrigger value="quote">Quote & Chart</TabsTrigger> */}
          <TabsTrigger value="debate-analyst">Debate Analyst</TabsTrigger>
          <TabsTrigger value="news-researcher">News Researcher</TabsTrigger>
          <TabsTrigger value="backtest">Backtest Engine</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

       
        {/* Debate Analyst Results */}
        <TabsContent value="debate-analyst" className="space-y-4 mt-4">
          {debateAnalystData ? (
            <>
            

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Trading Decision</h3>
                  {getDecisionBadge(debateAnalystData.decision.action)}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="text-2xl font-bold">
                      {(debateAnalystData.decision.confidence * 100).toFixed(1)}%
                    </div>
                    <Progress value={debateAnalystData.decision.confidence * 100} className="mt-2" />
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Position Size</div>
                    <div className="text-2xl font-bold">
                      {(debateAnalystData.decision.position_size * 100).toFixed(1)}%
                    </div>
                    <Progress value={debateAnalystData.decision.position_size * 100} className="mt-2" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Reasoning</div>
                    <MarkdownRenderer content={debateAnalystData.decision.reasoning} />
                </div>
              </Card>

              {debateAnalystData.decision.debate_summary && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Debate Summary</h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Bull Arguments
                      </h4>
                      <ul className="space-y-2">
                        {debateAnalystData.decision.debate_summary.bull_arguments.map((arg, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <div className="flex-1">
                              <MarkdownRenderer content={arg} className="!space-y-1 text-sm [&>p]:!text-inherit [&>p]:!m-0" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Bear Arguments
                      </h4>
                      <ul className="space-y-2">
                        {debateAnalystData.decision.debate_summary.bear_arguments.map((arg, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                              <MarkdownRenderer content={arg} className="!space-y-1 text-sm [&>p]:!text-inherit [&>p]:!m-0" />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                    <div className="text-sm text-muted-foreground">
                      <MarkdownRenderer content={debateAnalystData.decision.debate_summary.risk_assessment} />
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Analysis Date: {debateAnalystData.date}</span>
                  <span>Timestamp: {new Date(debateAnalystData.timestamp).toLocaleString()}</span>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No Debate Analyst data. Click "Analyze" to get started.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* News Researcher Results */}
        <TabsContent value="news-researcher" className="space-y-4 mt-4">
          {newsResearcherData ? (
            <>
              {newsResearcherData.result.portfolio_manager_results && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Portfolio Manager Decision</h3>
                    {getDecisionBadge(newsResearcherData.result.portfolio_manager_results.decision)}
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="text-2xl font-bold">
                      {(newsResearcherData.result.portfolio_manager_results.confidence * 100).toFixed(1)}%
                    </div>
                    <Progress value={newsResearcherData.result.portfolio_manager_results.confidence * 100} className="mt-2" />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Reasoning</div>
                    <MarkdownRenderer content={newsResearcherData.result.portfolio_manager_results.reasoning} />
                  </div>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {newsResearcherData.result.technical_analysis_results && (
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Technical Analysis
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <MarkdownRenderer content={newsResearcherData.result.technical_analysis_results.summary || 'Data collected and analyzed'} />
                    </div>
                  </Card>
                )}

                {newsResearcherData.result.news_intelligence_results && (
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      News Intelligence
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <MarkdownRenderer content={newsResearcherData.result.news_intelligence_results.summary || 'Sentiment analysis complete'} />
                    </div>
                  </Card>
                )}

                {newsResearcherData.result.data_collection_results && (
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Data Collection
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      <MarkdownRenderer content={newsResearcherData.result.data_collection_results.summary || 'Market data retrieved'} />
                    </div>
                  </Card>
                )}
              </div>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Symbols: {newsResearcherData.symbols.join(', ')}</span>
                  <span>Date: {newsResearcherData.date}</span>
                  <span>Timestamp: {new Date(newsResearcherData.timestamp).toLocaleString()}</span>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No News Researcher data. Click "Analyze" to get started.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Backtest Results */}
        <TabsContent value="backtest" className="space-y-4 mt-4">
          {backtestData ? (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Backtest Results</h3>
                  <Badge className={backtestData.comparison.outperformed ? 'bg-green-500' : 'bg-red-500'}>
                    {backtestData.comparison.outperformed ? 'Outperformed' : 'Underperformed'} Buy & Hold
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* PrimoAgent Results */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-blue-600">PrimoAgent Strategy</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cumulative Return</span>
                        <span className="text-sm font-bold text-green-600">
                          +{backtestData.primo_results['Cumulative Return [%]'].toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Annual Return</span>
                        <span className="text-sm font-medium">
                          {backtestData.primo_results['Annual Return [%]'].toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="text-sm font-medium">
                          {backtestData.primo_results['Sharpe Ratio'].toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="text-sm font-medium text-red-600">
                          {backtestData.primo_results['Max Drawdown [%]'].toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className="text-sm font-medium">
                          {backtestData.primo_results['Win Rate [%]'].toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Trades</span>
                        <span className="text-sm font-medium">
                          {backtestData.primo_results['Total Trades']}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buy & Hold Results */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-gray-600">Buy & Hold Baseline</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cumulative Return</span>
                        <span className="text-sm font-bold text-green-600">
                          +{backtestData.buyhold_results['Cumulative Return [%]'].toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Annual Return</span>
                        <span className="text-sm font-medium">
                          {backtestData.buyhold_results['Annual Return [%]'].toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="text-sm font-medium">
                          {backtestData.buyhold_results['Sharpe Ratio'].toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="text-sm font-medium text-red-600">
                          {backtestData.buyhold_results['Max Drawdown [%]'].toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Metrics */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Performance Comparison</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Return Difference</span>
                      <span className={`text-sm font-bold ${backtestData.comparison.metrics.cumulative_return_diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {backtestData.comparison.metrics.cumulative_return_diff > 0 ? '+' : ''}
                        {backtestData.comparison.metrics.cumulative_return_diff.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Difference</span>
                      <span className={`text-sm font-medium ${backtestData.comparison.metrics.sharpe_diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {backtestData.comparison.metrics.sharpe_diff > 0 ? '+' : ''}
                        {backtestData.comparison.metrics.sharpe_diff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Values */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Final Portfolio Value</div>
                    <div className="text-2xl font-bold">
                      ${backtestData.primo_results['Final Portfolio Value [$]'].toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      From ${backtestData.primo_results['Starting Portfolio Value [$]'].toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Volatility</div>
                    <div className="text-2xl font-bold">
                      {backtestData.primo_results['Annual Volatility [%]'].toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Annual volatility
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Symbol: {backtestData.symbol}</span>
                  <span>Timestamp: {new Date(backtestData.timestamp).toLocaleString()}</span>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No backtest data. Click "Run Backtest" to get started.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Analysis History</h3>
              <Button onClick={fetchHistory} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            {historyLogs.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-3 bg-muted font-medium text-sm">
                  <div>Date</div>
                  <div>Symbol</div>
                  <div>Agent</div>
                  <div>Decision</div>
                  <div>Action</div>
                </div>
                <div className="divide-y">
                  {historyLogs.map((log: any) => {
                    const signal = typeof log.responseSignal === 'string' ? JSON.parse(log.responseSignal) : log.responseSignal;
                    const analysis = typeof log.responseAnalysis === 'string' ? JSON.parse(log.responseAnalysis) : log.responseAnalysis;
                    // Determine agent type based on available data fields
                    const agentType = analysis?.investmentDebate ? 'debate-analyst' : 'news-researcher';
                    
                    return (
                      <div key={log.id} className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-muted/50 transition-colors text-sm">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="font-medium">{log.symbol}</div>
                        <div className="capitalize">{agentType.replace('-', ' ')}</div>
                        <div>
                           {signal?.action && getDecisionBadge(signal.action)}
                        </div>
                        <div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedStock(log.symbol);
                              setActiveAgent(agentType as any);
                              
                              if (agentType === 'debate-analyst') {
                                const bullArgs = analysis.investmentDebate?.bullArguments;
                                const bearArgs = analysis.investmentDebate?.bearArguments;

                                setDebateAnalystData({
                                  success: true,
                                  symbol: log.symbol,
                                  date: new Date(log.timestamp).toISOString().split('T')[0],
                                  timestamp: log.timestamp,
                                  decision: {
                                    action: signal.action,
                                    confidence: signal.confidence,
                                    reasoning: signal.reasoning,
                                    position_size: 0.1, 
                                    debate_summary: analysis.investmentDebate ? {
                                      bull_arguments: Array.isArray(bullArgs) ? bullArgs : [bullArgs || ''],
                                      bear_arguments: Array.isArray(bearArgs) ? bearArgs : [bearArgs || ''],
                                      risk_assessment: analysis.investmentDebate.riskAssessment || "Historical Analysis"
                                    } : undefined
                                  }
                                });
                                setActiveTab("debate-analyst");
                              } else {
                                setNewsResearcherData({
                                   success: true,
                                   symbols: [log.symbol],
                                   date: new Date(log.timestamp).toISOString().split('T')[0],
                                   timestamp: log.timestamp,
                                   result: {
                                      portfolio_manager_results: {
                                        decision: signal.action,
                                        confidence: signal.confidence,
                                        reasoning: signal.reasoning
                                      },
                                      technical_analysis_results: { summary: analysis.marketReport },
                                      news_intelligence_results: { summary: analysis.newsReport },
                                      data_collection_results: { summary: analysis.fundamentalsReport }
                                   }
                                });
                                setActiveTab("news-researcher");
                              }
                            }}
                          >
                            View Analysis
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No history available
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
