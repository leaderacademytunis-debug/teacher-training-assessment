CREATE TABLE `videoProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` int NOT NULL,
	`watchedDuration` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`lastWatchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionAr` text,
	`videoUrl` text NOT NULL,
	`duration` int,
	`orderIndex` int NOT NULL,
	`isRequired` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
