CREATE TABLE `sharedPedagogicalSheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalSheetId` int NOT NULL,
	`publishedBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`lessonTitle` varchar(255) NOT NULL,
	`sheetData` json NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`cloneCount` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`ratingCount` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sharedPedagogicalSheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sheetComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedSheetId` int NOT NULL,
	`userId` int NOT NULL,
	`commentText` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sheetComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sheetRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedSheetId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sheetRatings_id` PRIMARY KEY(`id`)
);
