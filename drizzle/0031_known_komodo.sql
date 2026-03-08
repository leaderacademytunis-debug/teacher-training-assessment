CREATE TABLE `image_usage_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(100),
	`imagesGenerated` int NOT NULL DEFAULT 0,
	`monthYear` varchar(7) NOT NULL,
	`tier` varchar(20) NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `image_usage_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generated_images` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `generated_images` ADD `subject` varchar(100);--> statement-breakpoint
ALTER TABLE `generated_images` ADD `level` varchar(100);--> statement-breakpoint
ALTER TABLE `generated_images` ADD `source` varchar(50) DEFAULT 'studio';--> statement-breakpoint
ALTER TABLE `generated_images` ADD `noBgUrl` text;