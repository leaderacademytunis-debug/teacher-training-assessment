CREATE TABLE `suggestionRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`language` enum('arabic','french','english') NOT NULL,
	`usedReferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suggestionRatings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `referenceDocuments` ADD `extractedContent` mediumtext;