PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_blocks` (
	`id` text PRIMARY KEY DEFAULT lower(hex(randomblob(16))) NOT NULL,
	`page_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text DEFAULT '{}' NOT NULL,
	`position` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_blocks`("id", "page_id", "type", "content", "position", "created_at", "updated_at") SELECT "id", "page_id", "type", "content", "position", "created_at", "updated_at" FROM `blocks`;--> statement-breakpoint
DROP TABLE `blocks`;--> statement-breakpoint
ALTER TABLE `__new_blocks` RENAME TO `blocks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;