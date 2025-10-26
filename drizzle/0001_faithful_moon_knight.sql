PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`position` integer NOT NULL,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_blocks`("id", "page_id", "type", "content", "position", "in_trash", "created_at", "updated_at") SELECT "id", "page_id", "type", "content", "position", "in_trash", "created_at", "updated_at" FROM `blocks`;--> statement-breakpoint
DROP TABLE `blocks`;--> statement-breakpoint
ALTER TABLE `__new_blocks` RENAME TO `blocks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`all_day` integer DEFAULT 0,
	`color` text,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_calendar_events`("id", "user_id", "title", "description", "start_time", "end_time", "all_day", "color", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "start_time", "end_time", "all_day", "color", "in_trash", "created_at", "updated_at" FROM `calendar_events`;--> statement-breakpoint
DROP TABLE `calendar_events`;--> statement-breakpoint
ALTER TABLE `__new_calendar_events` RENAME TO `calendar_events`;--> statement-breakpoint
CREATE TABLE `__new_folders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text DEFAULT 'New Folder' NOT NULL,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_folders`("id", "user_id", "title", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "in_trash", "created_at", "updated_at" FROM `folders`;--> statement-breakpoint
DROP TABLE `folders`;--> statement-breakpoint
ALTER TABLE `__new_folders` RENAME TO `folders`;--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`link` text,
	`read` integer DEFAULT 0 NOT NULL,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("id", "user_id", "type", "title", "message", "link", "read", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "type", "title", "message", "link", "read", "in_trash", "created_at", "updated_at" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
CREATE TABLE `__new_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`parent_id` text,
	`is_folder` integer DEFAULT 1 NOT NULL,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_pages`("id", "user_id", "title", "description", "parent_id", "is_folder", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "parent_id", "is_folder", "in_trash", "created_at", "updated_at" FROM `pages`;--> statement-breakpoint
DROP TABLE `pages`;--> statement-breakpoint
ALTER TABLE `__new_pages` RENAME TO `pages`;--> statement-breakpoint
CREATE TABLE `__new_todos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`completed` integer DEFAULT 0,
	`priority` text DEFAULT 'low',
	`due_date` text,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_todos`("id", "user_id", "title", "description", "completed", "priority", "due_date", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "completed", "priority", "due_date", "in_trash", "created_at", "updated_at" FROM `todos`;--> statement-breakpoint
DROP TABLE `todos`;--> statement-breakpoint
ALTER TABLE `__new_todos` RENAME TO `todos`;