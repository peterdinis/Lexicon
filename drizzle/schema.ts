import { 
  sqliteTable, 
  text, 
  integer 
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ----------------------
// Pages Table
// ----------------------
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
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
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  page_id: text("page_id").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull().default("{}"), // JSON as text
  position: integer("position").notNull(),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Folders Table
// ----------------------
export const folders = sqliteTable("folders", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  user_id: text("user_id").notNull(),
  title: text("title").notNull().default("New Folder"),
  created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Todos Table
// ----------------------
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: integer("completed").default(0), // 0 = false, 1 = true
  priority: text("priority").default("low"),
  dueDate: text("due_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Calendar Events Table
// ----------------------
export const calendarEvents = sqliteTable("calendar_events", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  allDay: integer("all_day").default(0), // 0 = false, 1 = true
  color: text("color"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------
// Relations
// ----------------------
export const pagesRelations = {
  user_id: {
    references: "auth.users",
    onDelete: "cascade",
  },
};

export const blocksRelations = {
  page_id: {
    references: pages.id,
    onDelete: "cascade",
  },
};
