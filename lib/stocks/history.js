// src/download-year.ts
import axios from "axios"
import tar from "tar-stream"
import gunzip from "gunzip-maybe"
import { parse } from "csv-parse"
import { pipeline } from "stream"
import { promisify } from "util"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

const pipe = promisify(pipeline)

const FINNHUB_TOKEN = process.env.FINNHUB_TOKEN || "YOUR_TOKEN_HERE"
const EXCHANGE = "us"
const DATA_TYPE = "ohlc 1-minute"
const YEAR = 1992
const DB_PATH = "./ohlcv.db"

async function main() {
  const sqlite = createClient({
    url: process.env.DATABASE_URL || "file:./ohlcv.db",
  })
  const db = drizzle(sqlite)

  // Ensure table exists (you can also use migrations)
  await sqlite.execute(
    `CREATE TABLE IF NOT EXISTS ohlcv (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      ts INTEGER NOT NULL,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      volume REAL NOT NULL
    );`,
  )
  await sqlite.execute(`CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_ts ON ohlcv(symbol, ts);`)

  const insertBatch = async (rows) => {
    const statements = rows.map((r) => ({
      sql: `INSERT INTO ohlcv (symbol, ts, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [r.symbol, r.ts, r.open, r.high, r.low, r.close, r.volume],
    }))
    await sqlite.batch(statements)
  }

  for (let month = 1; month <= 12; month++) {
    const m = month.toString().padStart(2, "0")
    console.log(`Processing ${YEAR}-${m}...`)

    const url = new URL("https://finnhub.io/api/v1/bulk-download")
    url.searchParams.set("exchange", EXCHANGE)
    url.searchParams.set("dataType", DATA_TYPE)
    url.searchParams.set("year", String(YEAR))
    url.searchParams.set("month", String(month))
    url.searchParams.set("token", FINNHUB_TOKEN)

    const res = await axios.get(url.toString(), {
      responseType: "stream", // get raw stream
      maxRedirects: 5,
    })
    const extract = tar.extract()

    extract.on("entry", async (header, stream, next) => {
      try {
        if (!header.name.endsWith(".csv.gz")) {
          stream.resume()
          stream.on("end", next)
          return
        }

        const pathParts = header.name.split("/")
        const fileName = pathParts[pathParts.length - 1]
        const symbol = fileName.replace(".csv.gz", "")

        console.log(`  -> ${symbol} from ${header.name}`)

        const csvParser = parse({
          columns: true,
          trim: true,
          skip_empty_lines: true,
        })

        const batch = []
        const BATCH_SIZE = 1000

        csvParser.on("data", (row) => {
          // Adjust column names to Finnhub CSV header; typical: time, open, high, low, close, volume.[web:15][web:18][web:44]
          const ts = Number(row.time || row.timestamp)
          const open = Number(row.open)
          const high = Number(row.high)
          const low = Number(row.low)
          const close = Number(row.close)
          const volume = Number(row.volume || row.v)

          if (!Number.isFinite(ts)) return

          batch.push({ symbol, ts, open, high, low, close, volume })

          if (batch.length >= BATCH_SIZE) {
            insertBatch(batch.splice(0, batch.length)).catch(console.error)
          }
        })

        csvParser.on("end", () => {
          if (batch.length) insertBatch(batch).catch(console.error)
          next()
        })

        csvParser.on("error", (err) => {
          console.error(`CSV parse error for ${header.name}:`, err)
          next()
        })

        await pipe(stream, gunzip(), csvParser)
      } catch (err) {
        console.error(`Error processing ${header.name}:`, err)
        next()
      }
    })

    await new Promise((resolve, reject) => {
      extract.on("finish", resolve)
      extract.on("error", reject)

      pipe(res.data, extract).catch(reject)
    })
  }

  console.log("Done")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
