CREATE TABLE `marketplace_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`userId` int NOT NULL,
	`format` varchar(20) DEFAULT 'view',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplace_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publishedBy` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`contentType` enum('lesson_plan','exam','evaluation','drama_script','annual_plan','digitized_doc','other') NOT NULL,
	`subject` varchar(100) NOT NULL,
	`grade` varchar(100) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL DEFAULT 'primary',
	`period` varchar(50),
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`trimester` varchar(50),
	`content` mediumtext NOT NULL,
	`contentPreview` text,
	`thumbnailUrl` text,
	`sourceType` varchar(50),
	`sourceId` int,
	`wordExportUrl` text,
	`pdfExportUrl` text,
	`watermarkedPdfUrl` text,
	`contributorName` varchar(255),
	`contributorSchool` varchar(255),
	`aiInspectorScore` int,
	`averageRating` decimal(3,2) DEFAULT '0',
	`totalRatings` int NOT NULL DEFAULT 0,
	`totalDownloads` int NOT NULL DEFAULT 0,
	`totalViews` int NOT NULL DEFAULT 0,
	`rankingScore` decimal(8,4) DEFAULT '0',
	`status` enum('pending','approved','rejected','flagged') NOT NULL DEFAULT 'pending',
	`moderationNote` text,
	`moderatedBy` int,
	`moderatedAt` timestamp,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_ratings_id` PRIMARY KEY(`id`)
);
