import { db } from "../db";
import {
  polymarketLeaders,
  polymarketPositions,
  polymarketCategories,
  polymarketMarkets,
  polymarketMarketPositions,
  polymarketDebates,
} from "../db/schema";
import { eq, desc, asc } from "drizzle-orm";

// ============================================================================
// Fetching Functions
// ============================================================================

/**
 * Fetches active prediction markets from the Polymarket Gamma API.
 * @param limit - Maximum number of markets to retrieve (default: 50)
 * @param sortBy - Field to sort results by (default: "volume24hr")
 * @returns Array of market objects from Polymarket
 * @throws Error if the API request fails
 */
export async function fetchMarkets(limit = 50, sortBy = "volume24hr") {
  const BASE = "https://gamma-api.polymarket.com";
  const url = new URL(`${BASE}/markets`);

  url.searchParams.set("closed", "false");
  url.searchParams.set("active", "true");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("order", sortBy);
  url.searchParams.set("ascending", "false");

  const resp = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) throw new Error(`markets fetch failed: ${resp.status}`);
  return await resp.json();
}

/**
 * Fetches the Polymarket leaderboard with top traders ranked by volume or PnL.
 * @param options - Configuration options for the leaderboard query
 * @param options.timePeriod - Time period filter: "all", "1d", "7d", or "30d" (default: "all")
 * @param options.orderBy - Sort order: "VOL" for volume or "PNL" for profit/loss (default: "VOL")
 * @param options.limit - Maximum number of entries to retrieve (default: 20)
 * @param options.offset - Number of entries to skip for pagination (default: 0)
 * @param options.category - Category filter (default: "overall")
 * @returns Array of leaderboard entries
 * @throws Error if the API request fails
 */
export async function fetchLeaderboard(
  options: {
    timePeriod?: "all" | "1d" | "7d" | "30d";
    orderBy?: "VOL" | "PNL";
    limit?: number;
    offset?: number;
    category?: "overall" | string;
  } = {}
) {
  const {
    timePeriod = "all",
    orderBy = "VOL",
    limit = 20,
    offset = 0,
    category = "overall",
  } = options;

  const url = new URL("https://data-api.polymarket.com/v1/leaderboard");
  url.searchParams.set("timePeriod", timePeriod);
  url.searchParams.set("orderBy", orderBy);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("category", category);

  const resp = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) throw new Error(`leaderboard fetch failed: ${resp.status}`);
  return await resp.json();
}

/**
 * Fetches top traders from Polymarket Analytics API sorted by overall gain.
 * @param limit - Maximum number of traders to retrieve (default: 50)
 * @returns Array of trader objects with performance metrics
 * @throws Error if the API request fails
 */
export async function fetchTopTraders(limit = 50) {
  const resp = await fetch(
    "https://polymarketanalytics.com/api/traders-tag-performance",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tag: "Overall",
        sortColumn: "overall_gain",
        sortDirection: "DESC",
        minPnL: -4534159.552280787,
        maxPnL: 3203232.91229432,
        minActivePositions: 0,
        maxActivePositions: 38642,
        minWinAmount: 0,
        maxWinAmount: 20316723.043360095,
        minLossAmount: -20494980.369057264,
        maxLossAmount: 0,
        minWinRate: 0,
        maxWinRate: 100,
        minCurrentValue: 0,
        maxCurrentValue: 1000000000000,
        minTotalPositions: 1,
        maxTotalPositions: 56928,
      }),
    }
  );

  if (!resp.ok) throw new Error(`leaders fetch failed: ${resp.status}`);
  const data = await resp.json();

  // Handle both array (direct) and object { data: [...] } formats
  let traders = [];
  if (Array.isArray(data)) {
    traders = data;
  } else {
    console.error("Polymarket API returned non-array:", JSON.stringify(data));
    return [];
  }

  return traders.slice(0, limit);
}

/**
 * Fetches all positions for a specific trader from Polymarket Analytics API.
 * @param traderId - The unique identifier of the trader
 * @returns Array of position objects for the trader
 * @throws Error if the API request fails
 */
export async function fetchTraderPositions(traderId: string) {
  const resp = await fetch(
    "https://polymarketanalytics.com/api/traders-positions",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      body: JSON.stringify({ trader_id: traderId }),
    }
  );

  if (!resp.ok) throw new Error(`positions fetch failed: ${resp.status}`);
  return await resp.json();
}

/**
 * Fetches the order book for a specific market from Polymarket Gamma API.
 * @param marketId - The unique identifier of the market
 * @returns Order book object with bids and asks, or null if fetch fails
 */
export async function fetchMarketOrderBook(marketId: string) {
  const BASE = "https://gamma-api.polymarket.com";
  const url = new URL(`${BASE}/markets/${marketId}/order-book`);

  const resp = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) {
    console.error(
      `Order book fetch failed for market ${marketId}: ${resp.status}`
    );
    return null;
  }
  return await resp.json();
}

/**
 * Fetches detailed information for a specific market from Polymarket Gamma API.
 * @param marketId - The unique identifier of the market
 * @returns Market details object, or null if fetch fails
 */
export async function fetchMarketDetails(marketId: string) {
  const BASE = "https://gamma-api.polymarket.com";
  const url = new URL(`${BASE}/markets/${marketId}`);

  const resp = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) {
    console.error(
      `Market details fetch failed for market ${marketId}: ${resp.status}`
    );
    return null;
  }
  return await resp.json();
}

/**
 * Performs a public search across Polymarket events, markets, and profiles.
 * @param options - Search configuration options
 * @param options.q - The search query string (required)
 * @param options.cache - Whether to use cached results
 * @param options.events_status - Filter by event status
 * @param options.limit_per_type - Maximum results per type
 * @param options.page - Page number for pagination
 * @param options.events_tag - Array of tags to filter events
 * @param options.keep_closed_markets - Include closed markets (0 or 1)
 * @param options.sort - Sort field
 * @param options.ascending - Sort direction
 * @param options.search_tags - Include tags in search
 * @param options.search_profiles - Include profiles in search
 * @param options.recurrence - Recurrence filter
 * @param options.exclude_tag_id - Array of tag IDs to exclude
 * @param options.optimized - Use optimized search
 * @returns Search results object
 * @throws Error if the API request fails
 */
export async function searchPublic(options: {
  q: string;
  cache?: boolean;
  events_status?: string;
  limit_per_type?: number;
  page?: number;
  events_tag?: string[];
  keep_closed_markets?: number;
  sort?: string;
  ascending?: boolean;
  search_tags?: boolean;
  search_profiles?: boolean;
  recurrence?: string;
  exclude_tag_id?: number[];
  optimized?: boolean;
}) {
  const BASE = "https://gamma-api.polymarket.com";
  const url = new URL(`${BASE}/public-search`);

  // Add required query parameter
  url.searchParams.set("q", options.q);

  // Add optional query parameters
  if (options.cache !== undefined)
    url.searchParams.set("cache", String(options.cache));
  if (options.events_status)
    url.searchParams.set("events_status", options.events_status);
  if (options.limit_per_type !== undefined)
    url.searchParams.set("limit_per_type", String(options.limit_per_type));
  if (options.page !== undefined)
    url.searchParams.set("page", String(options.page));
  if (options.events_tag) {
    options.events_tag.forEach((tag) =>
      url.searchParams.append("events_tag", tag)
    );
  }
  if (options.keep_closed_markets !== undefined)
    url.searchParams.set(
      "keep_closed_markets",
      String(options.keep_closed_markets)
    );
  if (options.sort) url.searchParams.set("sort", options.sort);
  if (options.ascending !== undefined)
    url.searchParams.set("ascending", String(options.ascending));
  if (options.search_tags !== undefined)
    url.searchParams.set("search_tags", String(options.search_tags));
  if (options.search_profiles !== undefined)
    url.searchParams.set("search_profiles", String(options.search_profiles));
  if (options.recurrence)
    url.searchParams.set("recurrence", options.recurrence);
  if (options.exclude_tag_id) {
    options.exclude_tag_id.forEach((id) =>
      url.searchParams.append("exclude_tag_id", String(id))
    );
  }
  if (options.optimized !== undefined)
    url.searchParams.set("optimized", String(options.optimized));

  const resp = await fetch(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!resp.ok) {
    console.error(`Public search failed: ${resp.status}`);
    throw new Error(`Public search failed: ${resp.status}`);
  }
  return await resp.json();
}

/**
 * Fetch market summary analytics from Polymarket Analytics API
 * Provides volume, liquidity, and open interest data for a specific event
 */
export async function fetchMarketSummary(eventId: string) {
  const resp = await fetch(
    "https://polymarketanalytics.com/api/market-summary",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
      },
      body: JSON.stringify({ eventId }),
      cache: "no-store",
    }
  );

  if (!resp.ok) {
    console.error(`Market summary fetch failed: ${resp.status}`);
    throw new Error(`Market summary API error: ${resp.status}`);
  }
  return await resp.json();
}

/**
 * Fetch dashboard data from Polymarket Analytics API
 * Provides charts, holder information, and historical data for a specific event
 */
export async function fetchMarketsDashboard(eventId: string) {
  const resp = await fetch(
    "https://polymarketanalytics.com/api/markets-dashboard",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
      },
      body: JSON.stringify({ eventId }),
      cache: "no-store",
    }
  );

  if (!resp.ok) {
    console.error(`Markets dashboard fetch failed: ${resp.status}`);
    throw new Error(`Dashboard API error: ${resp.status}`);
  }
  return await resp.json();
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Saves or updates leader data in the database.
 * Uses upsert to update existing records or insert new ones.
 * @param leadersData - Array of leader objects from the API
 */
export async function saveLeaders(leadersData: any[]) {
  const now = Date.now();

  for (const leader of leadersData) {
    await db
      .insert(polymarketLeaders)
      .values({
        trader: leader.trader,
        overallGain: leader.overall_gain || 0,
        winRate: leader.win_rate || 0,
        activePositions: leader.active_positions || 0,
        totalPositions: leader.total_positions || 0,
        currentValue: leader.current_value || 0,
        winAmount: leader.win_amount || 0,
        lossAmount: leader.loss_amount || 0,
        updatedAt: new Date(now),
      })
      .onConflictDoUpdate({
        target: polymarketLeaders.trader,
        set: {
          overallGain: leader.overall_gain || 0,
          winRate: leader.win_rate || 0,
          activePositions: leader.active_positions || 0,
          totalPositions: leader.total_positions || 0,
          currentValue: leader.current_value || 0,
          winAmount: leader.win_amount || 0,
          lossAmount: leader.loss_amount || 0,
          updatedAt: new Date(now),
        },
      });
  }
}

/**
 * Saves or updates leaderboard data in the database.
 * Includes user profile information like username and verification status.
 * @param leaderboardData - Array of leaderboard entries from the API
 */
export async function saveLeaderboardData(leaderboardData: any[]) {
  const now = Date.now();

  for (const entry of leaderboardData) {
    await db
      .insert(polymarketLeaders)
      .values({
        trader: entry.proxyWallet,
        rank: parseInt(entry.rank),
        userName: entry.userName || null,
        xUsername: entry.xUsername || null,
        verifiedBadge: entry.verifiedBadge || false,
        profileImage: entry.profileImage || null,
        vol: entry.vol || 0,
        pnl: entry.pnl || 0,
        updatedAt: new Date(now),
      })
      .onConflictDoUpdate({
        target: polymarketLeaders.trader,
        set: {
          rank: parseInt(entry.rank),
          userName: entry.userName || null,
          xUsername: entry.xUsername || null,
          verifiedBadge: entry.verifiedBadge || false,
          profileImage: entry.profileImage || null,
          vol: entry.vol || 0,
          pnl: entry.pnl || 0,
          updatedAt: new Date(now),
        },
      });
  }
}

/**
 * Saves or updates position data for a specific trader in the database.
 * @param traderId - The unique identifier of the trader
 * @param positionsData - Array of position objects from the API
 */
export async function savePositions(traderId: string, positionsData: any[]) {
  const now = Date.now();

  for (const pos of positionsData) {
    const tags = JSON.stringify(pos.tags || pos.market_tags || []);
    const posId = `${traderId}-${pos.market_id || pos.id || Math.random()}`;

    await db
      .insert(polymarketPositions)
      .values({
        id: posId,
        traderId: traderId,
        marketId: pos.market_id || pos.id,
        marketTitle: pos.market_title || pos.title || "",
        cashPnl: pos.cashPnl || pos.cash_pnl || 0,
        realizedPnl: pos.realizedPnl || pos.realized_pnl || 0,
        tags: tags,
        createdAt: new Date(now),
      })
      .onConflictDoUpdate({
        target: polymarketPositions.id,
        set: {
          cashPnl: pos.cashPnl || pos.cash_pnl || 0,
          realizedPnl: pos.realizedPnl || pos.realized_pnl || 0,
          tags: tags,
        },
      });
  }
}

/**
 * Saves category data to the database, replacing all existing categories.
 * @param categoriesData - Array of category objects with tag and PnL data
 */
export async function saveCategories(categoriesData: any[]) {
  const now = Date.now();

  await db.delete(polymarketCategories);

  for (const cat of categoriesData) {
    await db.insert(polymarketCategories).values({
      tag: cat.tag,
      pnl: cat.pnl,
      updatedAt: new Date(now),
    });
  }
}

/**
 * Saves or updates market data in the database.
 * Handles outcomes, prices, tags, and other market metadata.
 * @param marketsData - Array of market objects from the API
 */
export async function saveMarkets(marketsData: any[]) {
  const now = Date.now();

  for (const market of marketsData) {
    await db
      .insert(polymarketMarkets)
      .values({
        id: market.id,
        question: market.question,
        slug: market.slug,
        description: market.description || null,
        image: market.imageUrl || market.image || null,
        volume24hr: market.volume24hr || 0,
        volumeTotal: market.volumeNum || market.volumeTotal || 0,
        active: market.active ?? true,
        closed: market.closed ?? false,
        outcomes: JSON.parse(market.outcomes || []),
        outcomePrices: JSON.parse(market.outcomePrices || []),
        tags: JSON.stringify(market.tags || []),
        endDate: market.endDate || null,
        groupItemTitle: market.groupItemTitle || null,
        enableOrderBook: market.enableOrderBook ?? false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      })
      .onConflictDoUpdate({
        target: polymarketMarkets.id,
        set: {
          question: market.question,
          description: market.description || null,
          image: market.imageUrl || market.image || null,
          volume24hr: market.volume24hr || 0,
          volumeTotal: market.volumeNum || market.volumeTotal || 0,
          active: market.active ?? true,
          closed: market.closed ?? false,
          outcomes: JSON.parse(market.outcomes || []),
          outcomePrices: JSON.parse(market.outcomePrices || []),
          tags: JSON.stringify(market.tags || []),
          endDate: market.endDate || null,
          groupItemTitle: market.groupItemTitle || null,
          enableOrderBook: market.enableOrderBook ?? false,
          updatedAt: new Date(now),
        },
      });
  }
}

/**
 * Saves order book positions for a specific market.
 * Clears existing positions and saves new bids and asks.
 * @param marketId - The unique identifier of the market
 * @param orderBookData - Order book object containing bids and asks arrays
 */
export async function saveMarketPositions(
  marketId: string,
  orderBookData: any
) {
  const now = Date.now();

  // Clear existing positions for this market
  await db
    .delete(polymarketMarketPositions)
    .where(eq(polymarketMarketPositions.marketId, marketId));

  if (!orderBookData || !orderBookData.bids || !orderBookData.asks) {
    return;
  }

  // Save buy orders (bids)
  for (const bid of orderBookData.bids || []) {
    const posId = `${marketId}-buy-${bid.price}-${Date.now()}-${Math.random()}`;
    await db.insert(polymarketMarketPositions).values({
      id: posId,
      marketId: marketId,
      outcome: bid.outcome || "Yes",
      price: bid.price || 0,
      size: bid.size || 0,
      side: "buy",
      totalValue: (bid.price || 0) * (bid.size || 0),
      createdAt: new Date(now),
    });
  }

  // Save sell orders (asks)
  for (const ask of orderBookData.asks || []) {
    const posId = `${marketId}-sell-${
      ask.price
    }-${Date.now()}-${Math.random()}`;
    await db.insert(polymarketMarketPositions).values({
      id: posId,
      marketId: marketId,
      outcome: ask.outcome || "No",
      price: ask.price || 0,
      size: ask.size || 0,
      side: "sell",
      totalValue: (ask.price || 0) * (ask.size || 0),
      createdAt: new Date(now),
    });
  }
}

/**
 * Saves or updates AI-generated debate analysis for a market.
 * Stores arguments for both sides, key factors, and uncertainties.
 * @param marketId - The unique identifier of the market
 * @param debateData - Debate analysis object containing arguments and metadata
 * @param debateData.question - The market question being debated
 * @param debateData.yesArguments - Array of arguments supporting "Yes"
 * @param debateData.noArguments - Array of arguments supporting "No"
 * @param debateData.yesSummary - Summary of the "Yes" position
 * @param debateData.noSummary - Summary of the "No" position
 * @param debateData.keyFactors - Key factors influencing the outcome
 * @param debateData.uncertainties - Known uncertainties in the analysis
 * @param debateData.currentYesPrice - Current price for "Yes" outcome
 * @param debateData.currentNoPrice - Current price for "No" outcome
 * @param debateData.llmProvider - Optional LLM provider used for analysis
 * @param debateData.model - Optional model name used for analysis
 */
export async function saveDebateAnalysis(
  marketId: string,
  debateData: {
    question: string;
    yesArguments: string[];
    noArguments: string[];
    yesSummary: string;
    noSummary: string;
    keyFactors: string[];
    uncertainties: string[];
    currentYesPrice: number;
    currentNoPrice: number;
    llmProvider?: string;
    model?: string;
  }
) {
  const now = Date.now();
  const debateId = `debate-${marketId}`;

  await db
    .insert(polymarketDebates)
    .values({
      id: debateId,
      marketId: marketId,
      question: debateData.question,
      yesArguments: JSON.stringify(debateData.yesArguments),
      noArguments: JSON.stringify(debateData.noArguments),
      yesSummary: debateData.yesSummary,
      noSummary: debateData.noSummary,
      keyFactors: JSON.stringify(debateData.keyFactors),
      uncertainties: JSON.stringify(debateData.uncertainties),
      currentYesPrice: debateData.currentYesPrice,
      currentNoPrice: debateData.currentNoPrice,
      llmProvider: debateData.llmProvider || null,
      model: debateData.model || null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    })
    .onConflictDoUpdate({
      target: polymarketDebates.marketId,
      set: {
        question: debateData.question,
        yesArguments: JSON.stringify(debateData.yesArguments),
        noArguments: JSON.stringify(debateData.noArguments),
        yesSummary: debateData.yesSummary,
        noSummary: debateData.noSummary,
        keyFactors: JSON.stringify(debateData.keyFactors),
        uncertainties: JSON.stringify(debateData.uncertainties),
        currentYesPrice: debateData.currentYesPrice,
        currentNoPrice: debateData.currentNoPrice,
        llmProvider: debateData.llmProvider || null,
        model: debateData.model || null,
        updatedAt: new Date(now),
      },
    });
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Retrieves leaders from the database sorted by specified metric.
 * @param orderBy - Sort metric: "vol" for volume, "pnl" for profit/loss, or "overallGain" (default: "vol")
 * @param limit - Maximum number of leaders to retrieve (default: 50)
 * @returns Array of leader records from the database
 */
export async function getLeaders(
  orderBy: "vol" | "pnl" | "overallGain" = "vol",
  limit = 50
) {
  const orderByColumn =
    orderBy === "vol"
      ? polymarketLeaders.vol
      : orderBy === "pnl"
        ? polymarketLeaders.pnl
        : polymarketLeaders.overallGain;

  return await db
    .select()
    .from(polymarketLeaders)
    .orderBy(desc(orderByColumn))
    .limit(limit);
}

/**
 * Retrieves all positions for a specific trader from the database.
 * @param traderId - The unique identifier of the trader
 * @returns Array of position records for the trader
 */
export async function getTraderPositions(traderId: string) {
  return await db
    .select()
    .from(polymarketPositions)
    .where(eq(polymarketPositions.traderId, traderId));
}

/**
 * Retrieves best and worst performing categories from the database.
 * @returns Object with "best" and "worst" arrays of category records (top 20 each)
 */
export async function getCategories() {
  const best = await db
    .select()
    .from(polymarketCategories)
    .orderBy(desc(polymarketCategories.pnl))
    .limit(20);

  const worst = await db
    .select()
    .from(polymarketCategories)
    .orderBy(asc(polymarketCategories.pnl))
    .limit(20);

  return { best, worst };
}

/**
 * Retrieves markets from the database with filtering and sorting options.
 * @param options - Query configuration options
 * @param options.limit - Maximum number of markets to retrieve (default: 50)
 * @param options.sortBy - Sort field: "volume24hr", "volumeTotal", or "createdAt" (default: "volume24hr")
 * @param options.category - Optional category tag to filter by
 * @param options.activeOnly - Only include active markets (default: true)
 * @returns Array of market records matching the criteria
 */
export async function getMarkets(
  options: {
    limit?: number;
    sortBy?: "volume24hr" | "volumeTotal" | "createdAt";
    category?: string;
    activeOnly?: boolean;
  } = {}
) {
  const {
    limit = 50,
    sortBy = "volume24hr",
    category,
    activeOnly = true,
  } = options;

  let query = db.select().from(polymarketMarkets);

  // Filter by active status
  if (activeOnly) {
    query = query.where(eq(polymarketMarkets.active, true)) as any;
  }

  // Sort
  const orderByColumn =
    sortBy === "volume24hr"
      ? polymarketMarkets.volume24hr
      : sortBy === "volumeTotal"
        ? polymarketMarkets.volumeTotal
        : polymarketMarkets.createdAt;

  query = query.orderBy(desc(orderByColumn)) as any;

  // Apply limit
  query = query.limit(limit) as any;

  const results = await query;

  // Filter by category if specified
  if (category) {
    return results.filter((market: any) => {
      try {
        const tags = JSON.parse(market.tags || "[]");
        return tags.includes(category);
      } catch {
        return false;
      }
    });
  }

  return results;
}

/**
 * Retrieves active markets grouped by their category tags.
 * @returns Object with category tags as keys and arrays of market records as values
 */
export async function getMarketsByCategory() {
  const markets = await db
    .select()
    .from(polymarketMarkets)
    .where(eq(polymarketMarkets.active, true))
    .orderBy(desc(polymarketMarkets.volume24hr))
    .limit(100);

  const categorized: Record<string, any[]> = {};

  for (const market of markets) {
    try {
      const tags = JSON.parse(market.tags || "[]");
      for (const tag of tags) {
        if (!categorized[tag]) {
          categorized[tag] = [];
        }
        categorized[tag].push(market);
      }
    } catch {
      // Skip markets with invalid tags
    }
  }

  return categorized;
}

/**
 * Retrieves order book positions for a specific market from the database.
 * @param marketId - The unique identifier of the market
 * @returns Array of position records sorted by total value descending
 */
export async function getMarketPositions(marketId: string) {
  return await db
    .select()
    .from(polymarketMarketPositions)
    .where(eq(polymarketMarketPositions.marketId, marketId))
    .orderBy(desc(polymarketMarketPositions.totalValue));
}

/**
 * Retrieves the debate analysis for a specific market from the database.
 * @param marketId - The unique identifier of the market
 * @returns Debate record if found, or null if no debate exists for the market
 */
export async function getMarketDebate(marketId: string) {
  const results = await db
    .select()
    .from(polymarketDebates)
    .where(eq(polymarketDebates.marketId, marketId))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyzes positions to calculate aggregated PnL by category tag.
 * @param allPositions - Array of position objects with tags and PnL data
 * @returns Object with "best" and "worst" arrays of category performance (top 20 each)
 */
export function analyzeCategories(allPositions: any[]) {
  const tagPnl = new Map();

  for (const pos of allPositions) {
    const pnl = Number(
      pos.cash_pnl || pos.cashPnl || pos.realized_pnl || pos.realizedPnl || 0
    );
    if (!pnl) continue;

    let tags = pos.tags || pos.market_tags || [];
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [];
      }
    }

    for (const tag of tags) {
      const prev = tagPnl.get(tag) || 0;
      tagPnl.set(tag, prev + pnl);
    }
  }

  const arr = Array.from(tagPnl.entries()).map(([tag, pnl]) => ({ tag, pnl }));
  arr.sort((a, b) => b.pnl - a.pnl);

  const best = arr.slice(0, 20);
  const worst = [...arr].sort((a, b) => a.pnl - b.pnl).slice(0, 20);

  return { best, worst };
}

// ============================================================================
// Main Sync Function
// ============================================================================

/**
 * Syncs markets from Polymarket API to the database.
 * Clears existing markets and fetches fresh data sorted by 24h volume.
 * @param limit - Maximum number of markets to sync (default: 100)
 * @returns Object with count of synced markets
 */
export async function syncMarkets(limit = 100) {
  console.log("Starting Polymarket markets sync...");

  await db.delete(polymarketMarkets);

  const markets: any = await fetchMarkets(limit, "volume24hr");
  await saveMarkets(markets);
  console.log(`Saved ${markets.length} markets`);

  return { markets: markets.length };
}

/**
 * Syncs leaderboard data from Polymarket API to the database.
 * @param options - Sync configuration options
 * @param options.timePeriod - Time period filter: "all", "1d", "7d", or "30d"
 * @param options.orderBy - Sort order: "VOL" for volume or "PNL" for profit/loss
 * @param options.limit - Maximum number of entries to sync
 * @returns Object with count of synced leaderboard entries
 */
export async function syncLeaderboard(
  options: {
    timePeriod?: "all" | "1d" | "7d" | "30d";
    orderBy?: "VOL" | "PNL";
    limit?: number;
  } = {}
) {
  console.log("Starting Polymarket leaderboard sync...");

  const leaderboard: any = await fetchLeaderboard(options);
  await saveLeaderboardData(leaderboard);
  console.log(`Saved ${leaderboard.length} leaderboard entries`);

  return { leaders: leaderboard.length };
}

/**
 * Syncs top traders, their positions, and category analytics from Polymarket.
 * Fetches top 50 traders, retrieves all their positions, and calculates category performance.
 * @returns Object with counts of synced leaders and positions
 */
export async function syncLeadersAndCategories() {
  console.log("Starting Polymarket sync...");

  const leaders = await fetchTopTraders(50);
  await saveLeaders(leaders);
  console.log(`Saved ${leaders.length} leaders`);

  const allPositions = [];
  for (const trader of leaders) {
    const traderId = trader.trader;
    const positions = (await fetchTraderPositions(traderId)) as Position[];
    await savePositions(traderId, positions);
    allPositions.push(...positions);
    console.log(`Saved positions for trader ${traderId}`);
  }

  const categories = analyzeCategories(allPositions);
  await saveCategories([...categories.best, ...categories.worst]);
  console.log(
    `Saved ${categories.best.length + categories.worst.length} categories`
  );

  return { leaders: leaders.length, positions: allPositions.length };
}

/**
 * Performs a full synchronization of all Polymarket data.
 * Syncs markets, leaderboard, leaders, positions, and categories.
 * @returns Object with counts of all synced data types
 */
export async function syncAll() {
  console.log("Starting full Polymarket sync...");

  const marketsResult = await syncMarkets();
  const leaderboardResult = await syncLeaderboard({
    limit: 100,
    orderBy: "VOL",
  });
  const leadersResult = await syncLeadersAndCategories();

  return {
    markets: marketsResult.markets,
    leaderboard: leaderboardResult.leaders,
    leaders: leadersResult.leaders,
    positions: leadersResult.positions,
  };
}
