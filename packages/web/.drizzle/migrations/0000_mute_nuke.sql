CREATE TABLE `oauth_account` (
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`pet_id` integer,
	`creator_id` integer,
	`data_json` text,
	`date` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family_invite` (
	`invite_code` text(20) PRIMARY KEY NOT NULL,
	`inviter_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`invitation_hash` text(64) NOT NULL,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(100),
	`owner_id` text NOT NULL,
	`created_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family_user` (
	`family_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	PRIMARY KEY(`family_id`, `user_id`),
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `family_wait_list` (
	`family_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	PRIMARY KEY(`family_id`, `user_id`),
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pet` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text(200) NOT NULL,
	`gender` text,
	`species` text NOT NULL,
	`breed_name` text(200),
	`color` text,
	`date_of_birth` text(50),
	`weight` integer,
	`picture_url` text(120),
	`identity_number` text(120),
	`created_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	`updated_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reminder` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` integer NOT NULL,
	`pet_id` integer NOT NULL,
	`created_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
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
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(200),
	`avatar_url` text(200),
	`locale` text NOT NULL,
	`measurement_system` text NOT NULL,
	`created_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hash_idx` ON `family_invite` (`invitation_hash`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `family` (`owner_id`);