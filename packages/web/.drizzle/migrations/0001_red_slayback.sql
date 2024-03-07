CREATE TABLE `family_user` (
	`family_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`approved` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`approved`, `family_id`, `user_id`),
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
DROP INDEX IF EXISTS `family_idx`;--> statement-breakpoint
CREATE INDEX `approved_idx` ON `family_user` (`approved`);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `family_id`;