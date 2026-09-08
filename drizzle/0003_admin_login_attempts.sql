CREATE TABLE `admin_login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failed_count` integer NOT NULL,
	`window_started_at` text NOT NULL,
	`blocked_until` text
);
