CREATE TABLE `appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`location` text(400),
	`date` text(100),
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `prescription` ADD `end_date` text(100);--> statement-breakpoint
CREATE UNIQUE INDEX `appointment_id_unique` ON `appointment` (`id`);