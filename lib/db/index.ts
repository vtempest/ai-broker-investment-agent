
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon("postgresql://neondb_owner:npg_VqfAXxvF61nU@ep-broad-pond-afihi1ye-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
export const db = drizzle(sql, { schema });
