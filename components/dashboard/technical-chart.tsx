"use client"

import { Chart, CandlestickSeries } from "lightweight-charts-react-components"

interface TechnicalChartProps {
  data: {
    time: string | number // 'yyyy-mm-dd' or timestamp
    value?: number
    open?: number
    high?: number
    low?: number
    close?: number
  }[]
  title?: string
  colors?: {
    backgroundColor?: string
    lineColor?: string
    textColor?: string
    areaTopColor?: string
    areaBottomColor?: string
  }
}

export function TechnicalChart({ 
  data, 
  title = "Price Chart",
  colors = {} 
}: TechnicalChartProps) {
  const {
    backgroundColor = 'transparent',
    textColor = 'black',
  } = colors

  // Transform data to ensure it matches specific series requirements
  const validData = data.map(d => ({
    time: d.time as any, 
    open: d.open || d.value || 0,
    high: d.high || d.value || 0,
    low: d.low || d.value || 0,
    close: d.close || d.value || 0
  })).filter(d => d.open !== 0 || d.close !== 0); // Basic filter

  return (
    <div className="w-full relative h-[300px]">
       {title && <div className="absolute top-2 left-2 z-10 text-sm font-medium text-muted-foreground">{title}</div>}
       <Chart
          options={{
            layout: {
              background: { color: backgroundColor },
              textColor,
            },
            grid: {
              vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
              horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
            },
            timeScale: {
              borderColor: 'rgba(197, 203, 206, 0.3)',
              timeVisible: true,
            },
            rightPriceScale: {
              borderColor: 'rgba(197, 203, 206, 0.3)',
            },
            height: 300,
            autoSize: true, 
          }}
        >
          <CandlestickSeries
            data={validData}
            options={{
              upColor: '#26a69a',
              downColor: '#ef5350',
              borderVisible: false,
              wickUpColor: '#26a69a',
              wickDownColor: '#ef5350',
            }}
          />
        </Chart>
    </div>
  )
}
