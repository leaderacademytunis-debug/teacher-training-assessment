CREATE TABLE `adapted_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`original_title` varchar(500) NOT NULL,
	`original_content` text NOT NULL,
	`subject` varchar(100),
	`grade_level` varchar(50),
	`difficulty_type` varchar(100) NOT NULL,
	`adaptation_level` enum('light','moderate','intensive') NOT NULL DEFAULT 'moderate',
	`adapted_title` varchar(500),
	`adapted_content_text` text,
	`simplified_instructions` json,
	`visual_supports` json,
	`adaptation_notes` json,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adapted_content_id` PRIMARY KEY(`id`)
);
