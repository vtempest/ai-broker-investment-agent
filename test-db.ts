
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./lib/db/schema";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing database connection...");
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  try {
    const result = await db.select().from(schema.users).limit(1);
    console.log("Connection successful!", result);
  } catch (error) {
    console.error("Connection failed:", error);
    process.exit(1);
  }
}

main();
