CREATE TABLE `leader_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`balance` int NOT NULL DEFAULT 100,
	`total_earned` int NOT NULL DEFAULT 100,
	`total_spent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leader_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('earn','spend','bonus','refund') NOT NULL,
	`amount` int NOT NULL,
	`balance_after` int NOT NULL,
	`description` text NOT NULL,
	`feature_used` varchar(100),
	`reference_id` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_clones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'صوتي الرقمي',
	`status` enum('recording','processing','ready','failed') NOT NULL DEFAULT 'recording',
	`sample_audio_url` text,
	`sample_audio_key` varchar(500),
	`sample_duration_seconds` int,
	`external_voice_id` varchar(255),
	`external_provider` varchar(50) DEFAULT 'elevenlabs',
	`total_generations` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`error_message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_clones_id` PRIMARY KEY(`id`)
);
