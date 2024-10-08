CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`pet_id` text,
	`creator_id` text,
	`type` text NOT NULL,
	`note` text(1000),
	`activity_date` text(100) NOT NULL,
	FOREIGN KEY (`pet_id`) REFERENCES `pet`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_id_unique` ON `activity` (`id`);--> statement-breakpoint
CREATE INDEX `pet_id_idx` ON `activity` (`pet_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `activity` (`type`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `activity` (`activity_date`);--> statement-breakpoint
CREATE TABLE `activity_relationships` (
	`parent_activity_id` text,
	`child_activity_id` text,
	PRIMARY KEY(`parent_activity_id`, `child_activity_id`),
	FOREIGN KEY (`parent_activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `activity_appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`location` text(400),
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_appointment_id_unique` ON `activity_appointment` (`id`);--> statement-breakpoint
CREATE TABLE `oauth_account` (
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE INDEX `hash_idx` ON `family_invite` (`invitation_hash`);--> statement-breakpoint
CREATE TABLE `family` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(100),
	`owner_id` text NOT NULL,
	`created_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `family_id_unique` ON `family` (`id`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `family` (`owner_id`);--> statement-breakpoint
CREATE TABLE `family_user` (
	`family_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	PRIMARY KEY(`user_id`, `family_id`),
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `family_wait_list` (
	`family_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	PRIMARY KEY(`user_id`, `family_id`),
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
	`date_of_birth` text(100),
	`weight` integer,
	`height` integer,
	`picture_url` text(120),
	`identity_code` text(120),
	`created_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	`updated_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pet_id_unique` ON `pet` (`id`);--> statement-breakpoint
CREATE TABLE `activity_prescription` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`drug_name` text(200) NOT NULL,
	`schedule` text,
	`date_started` text(100),
	`end_date` text(100),
	`date_completed` text(100),
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_prescription_id_unique` ON `activity_prescription` (`id`);--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_session_id_unique` ON `user_session` (`id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(200),
	`avatar_url` text(200),
	`locale` text NOT NULL,
	`time_zone_id` text(100) NOT NULL,
	`measurement_system` text NOT NULL,
	`created_at` text(100) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_unique` ON `user` (`id`);--> statement-breakpoint
CREATE TABLE `activity_vaccination` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`vaccine_name` text(200) NOT NULL,
	`next_due_date` text(100),
	`batch_number` text(100),
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_vaccination_id_unique` ON `activity_vaccination` (`id`);