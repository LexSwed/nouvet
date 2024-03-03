CREATE TABLE `oauth_account` (
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`pet_id` integer,
	`creator_id` text,
	`data_json` text,
	`date` text(50) DEFAULT (CONCAT(datetime('now', 'utc'), 'Z')) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family-invite` (
	`id` text PRIMARY KEY NOT NULL,
	`inviter_id` text NOT NULL,
	`expires_at` integer DEFAULT (unixepoch() + 60 * 60) NOT NULL,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(100),
	`creator_id` text NOT NULL,
	`created_at` text(50) DEFAULT (CONCAT(datetime('now', 'utc'), 'Z')) NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pet` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text(200) NOT NULL,
	`gender` text,
	`animal_type` text NOT NULL,
	`breed_name` text(200),
	`color` text,
	`date_of_birth` text(50),
	`weight` integer,
	`picture_url` text(120),
	`created_at` text(50) DEFAULT (CONCAT(datetime('now', 'utc'), 'Z')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reminder` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`creator_id` text NOT NULL,
	`pet_id` integer NOT NULL,
	`created_at` text(50) DEFAULT (CONCAT(datetime('now', 'utc'), 'Z')) NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text(200),
	`avatar_url` text(200),
	`locale` text NOT NULL,
	`measurement_system` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` integer,
	`created_at` text(50) DEFAULT (CONCAT(datetime('now', 'utc'), 'Z')) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `family_idx` ON `user` (`family_id`);