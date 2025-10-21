import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ----------------------
// Pages Table
// ----------------------
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(), // removed default(sql`lower(hex(randomblob(16)))`)
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled"),
  description: text("description").notNull().default(""),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Blocks Table
// ----------------------
export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  page_id: text("page_id")
    .notNull()
    .references((): (typeof pages)["id"] => pages.id),
  type: text("type").notNull(),
  content: text("content").notNull().default("{}"),
  position: integer("position").notNull(),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Folders Table
// ----------------------
export const folders = sqliteTable("folders", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("New Folder"),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Todos Table
// ----------------------
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: integer("completed").default(0),
  priority: text("priority").default("low"),
  due_date: text("due_date"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Calendar Events Table
// ----------------------
export const calendarEvents = sqliteTable("calendar_events", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  all_day: integer("all_day").default(0),
  color: text("color"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
