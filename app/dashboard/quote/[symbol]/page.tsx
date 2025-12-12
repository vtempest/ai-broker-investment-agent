"use client"

import { useParams } from "next/navigation"
import { QuoteView } from "@/components/dashboard/quote-view"

export default function QuotePage() {
  const params = useParams()
  const symbol = typeof params.symbol === 'string' ? params.symbol : ''

  return <QuoteView symbol={symbol} />
}
