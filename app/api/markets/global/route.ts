import { NextRequest, NextResponse } from "next/server";
import { getRealTimeData, getHistoricalData } from "@/packages/investing/src/live-data/dukascopy-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Map of Dukascopy symbols to display info
const GLOBAL_INDICES = [
  { symbol: "usa30idxusd", name: "Dow Jones", country: "USA", countryCode: "US" },
  { symbol: "usa500idxusd", name: "S&P 500", country: "USA", countryCode: "US" },
  { symbol: "usatechidxusd", name: "Nasdaq 100", country: "USA", countryCode: "US" },
  { symbol: "ussc2000idxusd", name: "Russell 2000", country: "USA", countryCode: "US" },
  { symbol: "volidxusd", name: "VIX", country: "USA", countryCode: "US" },
  { symbol: "gbridxgbp", name: "FTSE 100", country: "UK", countryCode: "GB" },
  { symbol: "deuidxeur", name: "DAX 40", country: "Germany", countryCode: "DE" },
  { symbol: "fraidxeur", name: "CAC 40", country: "France", countryCode: "FR" },
  { symbol: "eusidxeur", name: "Euro Stoxx 50", country: "Europe", countryCode: "EU" },
  { symbol: "jpnidxjpy", name: "Nikkei 225", country: "Japan", countryCode: "JP" },
  { symbol: "hkgidxhkd", name: "Hang Seng", country: "Hong Kong", countryCode: "HK" },
  { symbol: "chiidxusd", name: "China A50", country: "China", countryCode: "CN" },
  { symbol: "ausidxaud", name: "ASX 200", country: "Australia", countryCode: "AU" },
  { symbol: "indidxusd", name: "Nifty 50", country: "India", countryCode: "IN" },
  { symbol: "cheidxchf", name: "SMI", country: "Switzerland", countryCode: "CH" },
  { symbol: "espidxeur", name: "IBEX 35", country: "Spain", countryCode: "ES" },
  { symbol: "itaidxeur", name: "FTSE MIB", country: "Italy", countryCode: "IT" },
  { symbol: "nldidxeur", name: "AEX", country: "Netherlands", countryCode: "NL" },
  { symbol: "soaidxzar", name: "JSE Top 40", country: "South Africa", countryCode: "ZA" },
  { symbol: "sgdidxsgd", name: "STI", country: "Singapore", countryCode: "SG" },
];

/**
 * GET /api/markets/global
 * Fetch real-time global market indices data from Dukascopy
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const results = await Promise.all(
      GLOBAL_INDICES.map(async (index) => {
        try {
          // Get real-time data for chart and current price
          const realtimeResult = await getRealTimeData({
            instrument: index.symbol,
            timeframe: "m15",
            last: 20,
          });

          if (!realtimeResult.success || !realtimeResult.data || !Array.isArray(realtimeResult.data) || realtimeResult.data.length === 0) {
            return null;
          }

          const realtimeData = realtimeResult.data as any[];
          const latestCandle = realtimeData[realtimeData.length - 1];
          const currentPrice = latestCandle.close;

          // Calculate daily change from real-time data
          const previousPrice = realtimeData[0].open;
          const dailyChange = currentPrice - previousPrice;
          const dailyChangePercent = (dailyChange / previousPrice) * 100;

          // Extract chart data (close prices)
          const chartData = realtimeData.map((candle: any) => candle.close);

          // Fetch historical data for monthly change (daily candles, last 30 days)
          let monthlyChangePercent = 0;
          try {
            const monthlyResult = await getHistoricalData({
              instrument: index.symbol,
              dates: { from: oneMonthAgo, to: now },
              timeframe: "d1",
            });

            if (monthlyResult.success && monthlyResult.data && Array.isArray(monthlyResult.data) && monthlyResult.data.length > 0) {
              const monthlyData = monthlyResult.data as any[];
              const monthAgoPrice = monthlyData[0].open;
              monthlyChangePercent = ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100;
            }
          } catch (e) {
            // Silent fail for monthly data
          }

          // Fetch historical data for yearly change (daily candles, last 365 days)
          let yearlyChangePercent = 0;
          try {
            const yearlyResult = await getHistoricalData({
              instrument: index.symbol,
              dates: { from: oneYearAgo, to: now },
              timeframe: "d1",
            });

            if (yearlyResult.success && yearlyResult.data && Array.isArray(yearlyResult.data) && yearlyResult.data.length > 0) {
              const yearlyData = yearlyResult.data as any[];
              const yearAgoPrice = yearlyData[0].open;
              yearlyChangePercent = ((currentPrice - yearAgoPrice) / yearAgoPrice) * 100;
            }
          } catch (e) {
            // Silent fail for yearly data
          }

          return {
            id: index.symbol,
            name: index.name,
            country: index.country,
            countryCode: index.countryCode,
            price: currentPrice,
            dailyChange: dailyChange,
            dailyChangePercent: dailyChangePercent,
            chartData: chartData,
            volume: latestCandle.volume || 0,
            monthlyChangePercent: monthlyChangePercent,
            yearlyChangePercent: yearlyChangePercent,
          };
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out indices with no data (null results)
    const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null && r.price > 0);

    return NextResponse.json({
      success: true,
      data: validResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Global markets API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch global markets data" },
      { status: 500 }
    );
  }
}
