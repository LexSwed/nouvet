ALTER TABLE `pet` ADD `updated_at` text(50) DEFAULT (strftime('%FT%TZ', datetime('now'))) NOT NULL;