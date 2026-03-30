CREATE TABLE `competency_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_points` int NOT NULL DEFAULT 0,
	`level` enum('beginner','advanced','expert','master') NOT NULL DEFAULT 'beginner',
	`month_year` varchar(7) NOT NULL,
	`monthly_points` int NOT NULL DEFAULT 0,
	`monthly_usage_count` int NOT NULL DEFAULT 0,
	`tool_usage` json,
	`badges` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`tool_type` varchar(100) NOT NULL,
	`points_earned` int NOT NULL,
	`previous_total` int NOT NULL,
	`new_total` int NOT NULL,
	`reference_id` varchar(255),
	`reference_type` varchar(100),
	`previous_level` varchar(50),
	`new_level` varchar(50),
	`level_changed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competency_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`challenge_id` int NOT NULL,
	`current_count` int NOT NULL DEFAULT 0,
	`target_count` int NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completed_at` timestamp,
	`bonus_points_awarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title_ar` varchar(255) NOT NULL,
	`description_ar` text NOT NULL,
	`tool_type` varchar(100) NOT NULL,
	`target_count` int NOT NULL,
	`bonus_points` int NOT NULL,
	`week_start` timestamp NOT NULL,
	`week_end` timestamp NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
