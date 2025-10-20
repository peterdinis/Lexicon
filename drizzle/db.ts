import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Create a single shared Postgres client (recommended in serverless envs)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// Export drizzle instance
export const db = drizzle(client);
