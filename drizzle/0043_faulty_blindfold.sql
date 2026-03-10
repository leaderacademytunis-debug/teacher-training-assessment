CREATE TABLE `saved_drama_scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonTitle` varchar(500) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`grade` varchar(100) NOT NULL,
	`duration` int NOT NULL DEFAULT 10,
	`studentCount` int NOT NULL DEFAULT 25,
	`scriptData` json NOT NULL,
	`maskImages` json,
	`assessmentQuestions` json,
	`roleAssignments` json,
	`pdfExportUrl` text,
	`isFavorite` boolean DEFAULT false,
	`isPublished` boolean DEFAULT false,
	`marketplaceItemId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_drama_scripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `marketplace_items` ADD `contributorPortfolioLink` text;