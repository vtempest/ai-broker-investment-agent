import fetch from "node-fetch";

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
      `Order book fetch failed for market ${marketId}: ${resp.status}`,
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
      `Market details fetch failed for market ${marketId}: ${resp.status}`,
    );
    return null;
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
    },
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
    },
  );

  if (!resp.ok) {
    console.error(`Markets dashboard fetch failed: ${resp.status}`);
    throw new Error(`Dashboard API error: ${resp.status}`);
  }
  return await resp.json();
}
