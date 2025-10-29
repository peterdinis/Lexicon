import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { 
  max: 1, // Recommended for drizzle
  prepare: false // Disable prepared statements for better compatibility
});

export const db = drizzle(client, { schema });