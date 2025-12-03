"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Play, Pause, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Strategy {
  id: string
  name: string
  type: string
  status: string
  riskLevel: string
  todayPnL: number
  last7DaysPnL: number
  last30DaysPnL: number
  winRate: number
  activeMarkets: number
  tradesToday: number
}

export function StrategiesTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    type: "momentum",
    riskLevel: "medium",
  })

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const response = await fetch("/api/user/strategies")
      const data = await response.json()
      setStrategies(data)
    } catch (error) {
      console.error("Error fetching strategies:", error)
    } finally {
      setLoading(false)
    }
  }

  const addStrategy = async () => {
    try {
      const response = await fetch("/api/user/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStrategy),
      })
      const created = await response.json()
      setStrategies([...strategies, created])
      setNewStrategy({ name: "", type: "momentum", riskLevel: "medium" })
    } catch (error) {
      console.error("Error adding strategy:", error)
    }
  }

  const toggleStrategy = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running"
    try {
      const response = await fetch(`/api/user/strategies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const updated = await response.json()
      setStrategies(strategies.map((s) => (s.id === id ? updated : s)))
    } catch (error) {
      console.error("Error toggling strategy:", error)
    }
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
        <h2 className="text-2xl font-bold">My Trading Strategies</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Strategy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Strategy Name</Label>
                <Input
                  placeholder="My Momentum Strategy"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={newStrategy.type}
                  onValueChange={(value) => setNewStrategy({ ...newStrategy, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momentum">Momentum Trading</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                    <SelectItem value="breakout">Breakout Trading</SelectItem>
                    <SelectItem value="day-scalp">Day Trading Scalp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select
                  value={newStrategy.riskLevel}
                  onValueChange={(value) => setNewStrategy({ ...newStrategy, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addStrategy}>Create Strategy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {strategies.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No strategies created yet. Create your first strategy to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{strategy.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{strategy.type.replace("-", " ")}</p>
                </div>
                <Badge
                  variant={
                    strategy.status === "running"
                      ? "default"
                      : strategy.status === "paused"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {strategy.status === "running" ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                  {strategy.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Today P&L</div>
                  <div
                    className={`text-lg font-bold ${strategy.todayPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {strategy.todayPnL >= 0 ? "+" : ""}${Math.abs(strategy.todayPnL).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">7D P&L</div>
                  <div
                    className={`text-lg font-bold ${strategy.last7DaysPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {strategy.last7DaysPnL >= 0 ? "+" : ""}${Math.abs(strategy.last7DaysPnL).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">30D P&L</div>
                  <div
                    className={`text-lg font-bold ${strategy.last30DaysPnL >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {strategy.last30DaysPnL >= 0 ? "+" : ""}${Math.abs(strategy.last30DaysPnL).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                  <div className="font-semibold">{strategy.winRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Active</div>
                  <div className="font-semibold">{strategy.activeMarkets}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Trades Today</div>
                  <div className="font-semibold">{strategy.tradesToday}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant={strategy.status === "running" ? "secondary" : "default"}
                  onClick={() => toggleStrategy(strategy.id, strategy.status)}
                >
                  {strategy.status === "running" ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
