import "dotenv/config";
import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",         
  schema: "./drizzle/schema.ts",
  dialect: "sqlite",     
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}) satisfies Config;