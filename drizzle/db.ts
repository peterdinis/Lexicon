import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const sqliteDb = new Database("dev.db");

export const db = drizzle(sqliteDb);