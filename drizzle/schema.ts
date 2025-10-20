import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  title: text("title").notNull().default("Untitled"),
  description: text("description").notNull().default(""),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  page_id: uuid("page_id").notNull(),
  type: text("type").notNull(),
  content: jsonb("content").notNull().default("{}"),
  position: integer("position").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const foldersId = () => folders.id;

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  parent_id: uuid("parent_id").references(foldersId).default(""),
  title: text("title").notNull().default("New Folder"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

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
