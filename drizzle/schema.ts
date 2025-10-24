import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ----------------------
// Pages Table
// ----------------------
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled"),
  description: text("description").notNull().default(""),
  parent_id: text("parent_id").references((): any => pages.id, {
    onDelete: "cascade",
  }),
  is_folder: integer("is_folder").notNull().default(1),
  in_trash: integer("in_trash").notNull().default(1), // bezpečný default
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
    .references((): any => pages.id),
  type: text("type").notNull(),
  content: text("content").notNull().default("{}"),
  position: integer("position").notNull(),
  in_trash: integer("in_trash").notNull().default(1), // bezpečný default
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
  in_trash: integer("in_trash").notNull().default(1), // doplnené pre konzistenciu
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
  status: text("status").default("pending"),
  notes: text("notes"),
  tags: text("tags"),
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
  in_trash: integer("in_trash").notNull().default(1), // doplnené pre konzistenciu
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Diagrams Table
// ----------------------
export const diagrams = sqliteTable("diagrams", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Diagram"),
  description: text("description"),
  nodes: text("nodes").notNull().default("[]"),
  edges: text("edges").notNull().default("[]"),
  viewport: text("viewport").notNull().default('{"x":0,"y":0,"zoom":1}'),
  deleted_at: text("deleted_at"),
  in_trash: integer("in_trash").notNull().default(0), // bezpečný default
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Notifications Table
// ----------------------
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"),
  read: integer("read").notNull().default(0),
  in_trash: integer("in_trash").notNull().default(1), // doplnené pre konzistenciu
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Indexes
// ----------------------
export const indexes = sql`
  CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
  CREATE INDEX IF NOT EXISTS idx_pages_is_folder ON pages(is_folder);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
`;
