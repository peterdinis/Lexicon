PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_diagrams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text DEFAULT 'Untitled Diagram' NOT NULL,
	`description` text,
	`nodes` text DEFAULT '[]' NOT NULL,
	`edges` text DEFAULT '[]' NOT NULL,
	`viewport` text DEFAULT '{"x":0,"y":0,"zoom":1}' NOT NULL,
	`deleted_at` text,
	`in_trash` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_diagrams`("id", "user_id", "title", "description", "nodes", "edges", "viewport", "deleted_at", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "nodes", "edges", "viewport", "deleted_at", "in_trash", "created_at", "updated_at" FROM `diagrams`;--> statement-breakpoint
DROP TABLE `diagrams`;--> statement-breakpoint
ALTER TABLE `__new_diagrams` RENAME TO `diagrams`;--> statement-breakpoint
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
	`icon` text,
	`cover_image` text,
	`parent_id` text,
	`is_folder` integer DEFAULT 1 NOT NULL,
	`in_trash` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_pages`("id", "user_id", "title", "description", "icon", "cover_image", "parent_id", "is_folder", "in_trash", "created_at", "updated_at") SELECT "id", "user_id", "title", "description", "icon", "cover_image", "parent_id", "is_folder", "in_trash", "created_at", "updated_at" FROM `pages`;--> statement-breakpoint
DROP TABLE `pages`;--> statement-breakpoint
ALTER TABLE `__new_pages` RENAME TO `pages`;--> statement-breakpoint
ALTER TABLE `blocks` ADD `in_trash` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `folders` ADD `in_trash` integer DEFAULT 1 NOT NULL;