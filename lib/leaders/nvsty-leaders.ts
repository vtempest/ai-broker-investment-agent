import { grab, log } from "grab-url";
import fs from "fs/promises";
import { db } from "@/lib/db";
import { nvstlyLeaders, nvstlyTrades } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LEADERS_FILE = "./data/leaders.json";


interface Trader {
  /** The unique identifier of the trader. */
  id: string;
  /** The name of the trader. */
  name: string;
  /** The rank of the trader among others. */
  rank: number;
  /** The reputation score of the trader. */
  rep: number;
  /** The total number of trades executed by the trader. */
  trades: number;
  /** The win rate percentage of the trader. */
  winRate: number;
  /** The total gain accumulated by the trader. */
  totalGain: number;
  /** The average return per trade for the trader. */
  avgReturn: number;
  /** An array of trades associated with the trader. */
  orders: Trade[];
  /** The broker associated with the trader. */
  broker: string;
}

interface Trade {
  /** The stock symbol of the trade. */
  symbol: string;
  /** The type of trade: 'buy', 'sell', or 'short'. */
  type: "buy" | "sell" | "short";
  /** The price at which the trade was executed. */
  price: number;
  /** The timestamp of the trade in ISO 8601 format. */
  time: string;
  /** The profit on close in percentage, if the trade is closed. */
  gain?: number;
  /** The previous price on open, relevant for closed or short trades. */
  previousPrice?: number;
}



/**
 * NVSTLY API client for fetching trader rankings and trades.
 */
class LeadersAPI {
  api: any;
  constructor() {
    this.api = grab.instance({
      baseURL: "https://db.nvstly.com/api",
      post: true,
      compress: false,
    });
  }

  /**
   * Fetches trader rankings from the NVSTLY API.
   *
   * @param {string} [time='1mo'] - The time frame for the rankings (e.g., '1mo', '3mo', '1y').
   * @returns {Promise<Trader[]>} A promise that resolves to the trader rankings data.
   */
  getTraderRankings = async (time = "1mo") : Promise<Trader[]> => {
    try {
      const response = await this.api(`/market/ranks`, {
        time,
        engines: ["stocks"],
      });

      console.log('NVSTLY API Response:', JSON.stringify(response, null, 2));

      if (!response?.data?.data) {
        console.error('Invalid response from NVSTLY API:', response);
        return [];
      }

      return response.data.data.map((trader: any) => ({
        id: trader.id,
        name: trader.name,
        rank: trader.rank,
        rep: trader.rep,
        trades: trader.trades,
        winRate: Math.floor(trader.winRate),
        totalGain: Math.floor(trader.totalGain),
        avgReturn: Math.floor(trader.avgReturn),
      }));
    } catch (error) {
      console.error('Error fetching trader rankings:', error);
      return [];
    }
  }

  /**
   * Fetches trader order flow from the NVSTLY API.
   *
   * @param {string} traderId - The ID of the trader to fetch trades for.
   * @param {string} [time='1mo'] - The time frame for the trades (e.g., '1mo', '3mo', '1y').
   * @returns {Promise<Trade[]>} A promise that resolves to the trader rankings data.
   */
  getTraderTrades = async (traderId: string, time: string = "1mo") : Promise<Trade[]> =>
    (
      await this.api("/accounts/trades", {
        id: traderId,
        filter: {
          frame: time,
          engines: ["options", "stocks", "crypto", "forex"],
        },
      })
    )?.data?.data.map((trade: any) => {
      log(trade);

      return {
        symbol: trade.symbol,
        type: trade.type == "short" ? "short" : trade.closed ? "sell" : "buy",
        // entryPrice: trade.entryPrice,
        // exitPrice: trade.exitPrice,
        time: new Date(trade.lastModified).toISOString(),
        price: Number(trade.price.toFixed(2)),
        ...((trade.type == "short" || trade.closed) && {
          previousPrice: Number(trade.previousEntryPrice.toFixed(2)),
        }),
        ...(trade.closed && { gain: Math.floor(trade.gain) }),
      };
    }) as Trade[];
}

export const myLeadersAPI = new LeadersAPI();

export async function syncCopyTradingLeadersOrders() {
  const traders = await myLeadersAPI.getTraderRankings();

  if (!traders || traders.length === 0) {
    console.log('Warning: No traders found from NVSTLY API');
    return [];
  }

  console.log(`Found ${traders.length} traders`);

  for (let i = 0; i < traders.length; i++) {
    const trader = traders[i];
    const traderId = trader.id;

    // Fetch trader's trades
    const trades = await myLeadersAPI.getTraderTrades(traderId);
    traders[i].orders = trades;
    console.log(
      `  Added ${trades.length} trades for ${trader.name}`
    );

    // Save trader to database
    await db
      .insert(nvstlyLeaders)
      .values({
        id: trader.id,
        name: trader.name,
        rank: trader.rank,
        rep: trader.rep,
        trades: trader.trades,
        winRate: trader.winRate,
        totalGain: trader.totalGain,
        avgReturn: trader.avgReturn,
        broker: trader.broker || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: nvstlyLeaders.id,
        set: {
          name: trader.name,
          rank: trader.rank,
          rep: trader.rep,
          trades: trader.trades,
          winRate: trader.winRate,
          totalGain: trader.totalGain,
          avgReturn: trader.avgReturn,
          broker: trader.broker || null,
          updatedAt: new Date(),
        },
      });

    // Delete old trades for this trader
    await db.delete(nvstlyTrades).where(eq(nvstlyTrades.traderId, trader.id));

    // Insert new trades
    if (trades.length > 0) {
      await db.insert(nvstlyTrades).values(
        trades.map((trade, index) => ({
          id: `${trader.id}-${trade.symbol}-${trade.time}-${index}`,
          traderId: trader.id,
          symbol: trade.symbol,
          type: trade.type,
          price: trade.price,
          previousPrice: trade.previousPrice || null,
          gain: trade.gain || null,
          time: new Date(trade.time),
          createdAt: new Date(),
        }))
      );
    }

    // Also save to JSON for backward compatibility
    await fs.writeFile(LEADERS_FILE, JSON.stringify(traders, null, 2));

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`Successfully synced ${traders.length} NVSTLY traders to database`);
  return traders;
}
