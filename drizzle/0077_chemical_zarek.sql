CREATE TABLE `name_edit_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`editedBy` int NOT NULL,
	`previousFirstNameAr` varchar(100),
	`previousLastNameAr` varchar(100),
	`previousFirstNameFr` varchar(100),
	`previousLastNameFr` varchar(100),
	`newFirstNameAr` varchar(100),
	`newLastNameAr` varchar(100),
	`newFirstNameFr` varchar(100),
	`newLastNameFr` varchar(100),
	`reason` text,
	`certificatesRegenerated` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `name_edit_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certificates` ADD `correctedName` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `lastRegeneratedAt` timestamp;