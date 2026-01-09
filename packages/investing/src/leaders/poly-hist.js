import { ClobClient } from "@polymarket/clob-client";
import fs from "fs";

// Initialize Polymarket CLOB client
const clobClient = new ClobClient("https://clob.polymarket.com", 137);

// Parse CSV to extract key info
async function parseCSV(csvPath) {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n");
  
  const markets = [];
  let i = 1; // Skip header
  
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    
    const parts = line.split(",");
    if (parts.length < 7) {
      i++;
      continue;
    }
    
    const createdAt = parts[0];
    const id = parseInt(parts[1]);
    const question = parts[2].replace(/^"|"$/g, "");
    const answer1 = parts[3];
    const answer2 = parts[4];
    const market_slug = parts[6];
    
    // Next two lines contain condition_id, ticker, closedTime
    let nextLine1 = lines[i + 1] || "";
    let nextLine2 = lines[i + 2] || "";
    
    const combined = nextLine1 + nextLine2;
    const conditionIdMatch = combined.match(/(0x[a-fA-F0-9]{64})/);
    const condition_id = conditionIdMatch ? conditionIdMatch[1] : null;
    
    const lastLineParts = nextLine2.split(",");
    const ticker = lastLineParts.length >= 2 ? lastLineParts[lastLineParts.length - 2] : market_slug;
    const closedTime = lastLineParts.length >= 1 ? lastLineParts[lastLineParts.length - 1].trim() : null;
    
    markets.push({
      id,
      question,
      answer1,
      answer2,
      market_slug,
      condition_id,
      ticker,
      closedTime: closedTime ? closedTime.replace(" ", "T").replace("+00", "Z") : null,
    });
    
    i += 3; // Move to next market block
  }
  
  return markets;
}

// Fetch CLOB token IDs from Gamma API
async function getClobTokenIds(market_slug) {
  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets/slug/${market_slug}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch market ${market_slug}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const clobTokenIds = data.clobTokenIds ? data.clobTokenIds.split(",") : [];
    
    return {
      slug: market_slug,
      conditionId: data.conditionId,
      question: data.question,
      outcomes: data.outcomes ? data.outcomes.split(",") : [],
      clobTokenIds,
    };
  } catch (error) {
    console.error(`Error fetching market ${market_slug}:`, error.message);
    return null;
  }
}

// Fetch daily price history for a token
async function getDailyPriceHistory(tokenId, startTs, endTs) {
  try {
    const history = await clobClient.getPricesHistory({
      market: tokenId,
      startTs,
      endTs,
      interval: "1d",
    });
    return history;
  } catch (error) {
    console.error(`Error fetching price history for ${tokenId}:`, error.message);
    return [];
  }
}

// Main execution
async function main() {
  // 1. Parse CSV
  const markets = await parseCSV("polymarket-questions.csv");
  console.log(`Parsed ${markets.length} markets from CSV`);
  
  fs.writeFileSync(
    "polymarket-markets-parsed.json",
    JSON.stringify(markets, null, 2)
  );
  
  // 2. Fetch CLOB token IDs
  const marketsWithTokens = [];
  
  for (const market of markets) {
    console.log(`Fetching tokens for: ${market.market_slug}`);
    const tokenData = await getClobTokenIds(market.market_slug);
    
    if (tokenData) {
      marketsWithTokens.push({ ...market, ...tokenData });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
  }
  
  fs.writeFileSync(
    "polymarket-markets-with-tokens.json",
    JSON.stringify(marketsWithTokens, null, 2)
  );
  
  // 3. Download price histories
  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;
  const priceHistories = {};
  
  for (const market of marketsWithTokens) {
    if (!market.clobTokenIds || market.clobTokenIds.length === 0) {
      continue;
    }
    
    console.log(`Fetching price history for: ${market.slug}`);
    const marketHistory = {};
    
    for (let i = 0; i < market.clobTokenIds.length; i++) {
      const tokenId = market.clobTokenIds[i];
      const outcome = market.outcomes[i] || `outcome_${i}`;
      
      const history = await getDailyPriceHistory(tokenId, oneYearAgo, now);
      marketHistory[outcome] = { tokenId, history };
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    priceHistories[market.slug] = {
      question: market.question,
      conditionId: market.conditionId,
      outcomes: marketHistory,
    };
  }
  
  fs.writeFileSync(
    "polymarket-price-histories.json",
    JSON.stringify(priceHistories, null, 2)
  );
  
  console.log("\nDone! Created 3 files:");
  console.log("1. polymarket-markets-parsed.json - Parsed CSV data");
  console.log("2. polymarket-markets-with-tokens.json - Markets with CLOB token IDs");
  console.log("3. polymarket-price-histories.json - Daily price histories");
}

main().catch(console.error);
