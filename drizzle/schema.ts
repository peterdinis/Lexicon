import { pgTable, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ----------------------
// Pages Table
// ----------------------
export const pages = pgTable("pages", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled"),
  description: text("description").notNull().default(""),
  icon: text("icon"),
  coverImage: text("cover_image"),
  parent_id: text("parent_id"),
  is_folder: boolean("is_folder").notNull().default(true),
  in_trash: boolean("in_trash").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Blocks Table
// ----------------------
export const blocks = pgTable("blocks", {
  id: text("id").primaryKey(),
  page_id: text("page_id")
    .notNull()
    .references(() => pages.id),
  type: text("type").notNull(),
  content: jsonb("content").notNull().default({}),
  position: integer("position").notNull(),
  in_trash: boolean("in_trash").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Folders Table
// ----------------------
export const folders = pgTable("folders", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("New Folder"),
  in_trash: boolean("in_trash").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Todos Table
// ----------------------
export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("low"),
  due_date: timestamp("due_date"),
  status: text("status").default("pending"),
  notes: text("notes"),
  tags: text("tags"),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Calendar Events Table
// ----------------------
export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  all_day: boolean("all_day").default(false),
  color: text("color"),
  in_trash: boolean("in_trash").notNull().default(true),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Diagrams Table
// ----------------------
export const diagrams = pgTable("diagrams", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Diagram"),
  description: text("description"),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  viewport: jsonb("viewport").notNull().default({ x: 0, y: 0, zoom: 1 }),
  deleted_at: timestamp("deleted_at"),
  in_trash: boolean("in_trash").notNull().default(false),
  created_at: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Indexes
// ----------------------
export const indexes = sql`
  CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
  CREATE INDEX IF NOT EXISTS idx_pages_is_folder ON pages(is_folder);
`;