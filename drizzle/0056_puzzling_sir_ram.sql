CREATE TABLE `ai_director_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`originalScript` text NOT NULL,
	`subject` varchar(100),
	`level` varchar(100),
	`characterProfile` enum('teacher','leader','custom') NOT NULL DEFAULT 'teacher',
	`customCharacterDesc` text,
	`scenes` json,
	`soundtrack` json,
	`finalVideoUrl` text,
	`status` enum('draft','scenes_generated','images_generating','videos_generating','merging','completed','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_director_projects_id` PRIMARY KEY(`id`)
);
