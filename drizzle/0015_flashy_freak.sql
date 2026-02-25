CREATE TABLE `infographics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text,
	`style` varchar(50) NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`prompt` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `infographics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mindMaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`centralTopic` varchar(255) NOT NULL,
	`description` text,
	`mapData` json NOT NULL,
	`imageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mindMaps_id` PRIMARY KEY(`id`)
);
