
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users } from "lucide-react"

interface Holder {
    id: string
    address: string
    userName?: string | null
    profileImage?: string | null
    rank: number
    outcome?: string | null
    balance: number
    value: number
}

interface TopHoldersListProps {
    marketId: string
    eventId?: string
}

export function TopHoldersList({ marketId, eventId }: TopHoldersListProps) {
    const [holders, setHolders] = useState<Holder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHolders = async () => {
            try {
                setLoading(true)
                const eventParam = eventId ? `&eventId=${eventId}` : ''
                // Always try to sync on first load to get fresh data since we don't have a background job yet
                const response = await fetch(`/api/polymarket/holders?marketId=${marketId}${eventParam}&sync=true`)
                const data = await response.json()

                if (data.success) {
                    setHolders(data.holders)
                } else {
                    setError(data.error)
                }
            } catch (err) {
                console.error("Error fetching holders", err)
                setError("Failed to load holders")
            } finally {
                setLoading(false)
            }
        }

        if (marketId) {
            fetchHolders()
        }
    }, [marketId, eventId])

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || holders.length === 0) {
        return (
            <div className="text-xs text-muted-foreground text-center p-2">
                No holder info available
            </div>
        )
    }

    // Separate holders by outcome
    const yesHolders = holders.filter(h => h.outcome?.toLowerCase() === 'yes')
    const noHolders = holders.filter(h => h.outcome?.toLowerCase() === 'no')

    const renderHoldersList = (holdersList: Holder[]) => (
        <div className="space-y-1">
            {holdersList.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center p-2">
                    No holders found
                </div>
            ) : (
                holdersList.slice(0, 10).map((holder, index) => (
                    <div key={holder.id} className="flex items-center justify-between text-xs bg-muted/30 p-2 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className="h-4 px-1 text-[10px] min-w-[20px] justify-center flex-shrink-0">
                                #{index + 1}
                            </Badge>
                            <div className="flex flex-col min-w-0">
                                {holder.userName ? (
                                    <>
                                        <span className="font-medium truncate">{holder.userName}</span>
                                        <span className="font-mono text-[10px] text-muted-foreground truncate" title={holder.address}>
                                            {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="font-mono text-muted-foreground truncate" title={holder.address}>
                                        {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="font-medium flex-shrink-0 ml-2">
                            ${holder.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </div>
                ))
            )}
        </div>
    )

    return (
        <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Users className="h-3 w-3" />
                Top Holders
            </div>
            <Tabs defaultValue="yes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yes" className="text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Yes ({yesHolders.length})
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="no" className="text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            No ({noHolders.length})
                        </span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="yes" className="mt-2">
                    {renderHoldersList(yesHolders)}
                </TabsContent>
                <TabsContent value="no" className="mt-2">
                    {renderHoldersList(noHolders)}
                </TabsContent>
            </Tabs>
        </div>
    )
}
