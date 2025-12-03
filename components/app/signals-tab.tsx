"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Signal {
  id: string
  asset: string
  type: string
  combinedScore: number
  scoreLabel: string
  strategy?: string
  timeframe?: string
  suggestedAction?: string
  suggestedSize?: string
}

export function SignalsTab() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newSignal, setNewSignal] = useState({
    asset: "",
    type: "stock",
    combinedScore: 0.5,
    scoreLabel: "Hold",
    strategy: "",
    timeframe: "daily",
  })

  useEffect(() => {
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    try {
      const response = await fetch("/api/user/signals")
      const data = await response.json()
      setSignals(data)
    } catch (error) {
      console.error("Error fetching signals:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSignal = async () => {
    try {
      const response = await fetch("/api/user/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSignal),
      })
      const created = await response.json()
      setSignals([created, ...signals])
      setNewSignal({
        asset: "",
        type: "stock",
        combinedScore: 0.5,
        scoreLabel: "Hold",
        strategy: "",
        timeframe: "daily",
      })
    } catch (error) {
      console.error("Error adding signal:", error)
    }
  }

  const filteredSignals = signals.filter((signal) =>
    signal.asset.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getScoreBadge = (label: string) => {
    if (label === 'Strong Buy') return "bg-green-500 text-white"
    if (label === 'Buy') return "bg-blue-500 text-white"
    if (label === 'Hold') return "bg-yellow-500 text-white"
    return "bg-red-500 text-white"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Signals & Watchlist</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Signal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Signal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Asset Symbol</Label>
                <Input
                  placeholder="AAPL"
                  value={newSignal.asset}
                  onChange={(e) => setNewSignal({ ...newSignal, asset: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newSignal.type}
                  onValueChange={(value) => setNewSignal({ ...newSignal, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="prediction_market">Prediction Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Score Label</Label>
                <Select
                  value={newSignal.scoreLabel}
                  onValueChange={(value) => setNewSignal({ ...newSignal, scoreLabel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong Buy">Strong Buy</SelectItem>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                    <SelectItem value="Strong Sell">Strong Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Combined Score (0-1)</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newSignal.combinedScore}
                  onChange={(e) => setNewSignal({ ...newSignal, combinedScore: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addSignal}>Add Signal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search signals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredSignals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No signals found. Add your first signal to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSignals.map((signal) => (
            <Card key={signal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{signal.asset}</h3>
                  <Badge variant="outline" className="mt-1">
                    {signal.type === 'stock' ? 'Stock' : 'PM'}
                  </Badge>
                </div>
                <Badge className={getScoreBadge(signal.scoreLabel)}>
                  {signal.scoreLabel}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-semibold">{(signal.combinedScore * 100).toFixed(0)}%</span>
                </div>
                {signal.strategy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Strategy</span>
                    <span className="font-semibold">{signal.strategy}</span>
                  </div>
                )}
                {signal.timeframe && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timeframe</span>
                    <span className="font-semibold capitalize">{signal.timeframe}</span>
                  </div>
                )}
              </div>

              {signal.suggestedAction && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">{signal.suggestedAction}</div>
                  {signal.suggestedSize && (
                    <div className="text-xs text-muted-foreground">{signal.suggestedSize}</div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
