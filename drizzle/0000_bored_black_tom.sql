CREATE TABLE `consultation_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`status` text,
	`external_event_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `consultation_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultation_messages_external_event_id_unique` ON `consultation_messages` (`external_event_id`);--> statement-breakpoint
CREATE INDEX `consultation_messages_session_created_idx` ON `consultation_messages` (`session_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `consultation_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
