CREATE TABLE `savedPrompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`promptText` text NOT NULL,
	`educationLevel` enum('primary','middle','secondary'),
	`grade` varchar(50),
	`subject` varchar(100),
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	CONSTRAINT `savedPrompts_id` PRIMARY KEY(`id`)
);
