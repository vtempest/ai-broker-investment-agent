import { NextRequest, NextResponse } from "next/server";
import { db } from "@/packages/investing/src/db";
import { polymarketHolders } from "@/packages/investing/src/db/schema";
import {
  fetchMarketsDashboard,
  saveHolders,
} from "@/packages/investing/src/prediction";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const marketId = searchParams.get("marketId");
    const eventId = searchParams.get("eventId");
    const sync = searchParams.get("sync") === "true";

    if (!marketId) {
      return NextResponse.json(
        { success: false, error: "Market ID is required" },
        { status: 400 },
      );
    }

    // If sync is requested, fetch fresh data from Polymarket
    if (sync) {
      try {
        // We need an event ID to fetch the dashboard.
        // If provided, use it. If not, we might be out of luck unless we look it up.
        // For now, we rely on the client passing eventId if available.
        const idToUse = eventId || marketId; // Fallback to marketId (sometimes works if they match or for slugs)

        if (idToUse) {
          const dashboardData = await fetchMarketsDashboard(idToUse);

          if (dashboardData) {
            let allHolders: any[] = [];

            // Handle different response formats
            if (dashboardData.holders && Array.isArray(dashboardData.holders)) {
              // Single array of holders
              allHolders = dashboardData.holders;
            } else if (dashboardData.yesHolders || dashboardData.noHolders) {
              // Separate arrays for Yes and No holders
              const yesHolders = (dashboardData.yesHolders || []).map(
                (h: any) => ({
                  ...h,
                  outcome: "Yes",
                }),
              );
              const noHolders = (dashboardData.noHolders || []).map(
                (h: any) => ({
                  ...h,
                  outcome: "No",
                }),
              );
              allHolders = [...yesHolders, ...noHolders];
            }

            if (allHolders.length > 0) {
              await saveHolders(marketId, allHolders);
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing holders for market ${marketId}:`, error);
        // Continue to return cached data even if sync fails
      }
    }

    // Fetch holders from database
    const holders = await db
      .select()
      .from(polymarketHolders)
      .where(eq(polymarketHolders.marketId, marketId))
      .orderBy(asc(polymarketHolders.rank));

    return NextResponse.json({
      success: true,
      holders,
    });
  } catch (error: any) {
    console.error("Error in /api/polymarket/holders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
