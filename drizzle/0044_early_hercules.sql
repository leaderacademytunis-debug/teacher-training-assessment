CREATE TABLE `ai_video_teasers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scriptId` int,
	`title` varchar(500) NOT NULL,
	`prompt` text NOT NULL,
	`videoUrl` text,
	`thumbnailUrl` text,
	`duration` int DEFAULT 30,
	`status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_video_teasers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peer_review_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`comment` text NOT NULL,
	`isAiFiltered` boolean DEFAULT false,
	`aiFilterResult` enum('approved','modified','rejected'),
	`originalComment` text,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `peer_review_comments_id` PRIMARY KEY(`id`)
);
