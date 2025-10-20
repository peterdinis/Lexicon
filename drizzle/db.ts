import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Create SQLite connection
const sqliteDb = new Database(process.env.DATABASE_URL || "dev.db");

// Export Drizzle instance
export const db = drizzle(sqliteDb);