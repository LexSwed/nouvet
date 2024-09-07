CREATE TABLE `prescription` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text,
	`drug_name` text(200) NOT NULL,
	`schedule` text,
	`duration` text,
	`date_started` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
CREATE UNIQUE INDEX `prescription_id_unique` ON `prescription` (`id`);