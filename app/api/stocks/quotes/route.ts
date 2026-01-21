import { NextRequest, NextResponse } from "next/server";
import { yahooFinance } from "@/packages/investing/src/stocks/yahoo-finance-wrapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stocks/quotes?symbols=AAPL,MSFT,GOOGL
 * Get real-time quotes for multiple stock symbols
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json(
        { error: "symbols parameter is required" },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());
    const result = await yahooFinance.getQuotes(symbols);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error("Stocks quotes API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
