CREATE TABLE `connection_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherUserId` int NOT NULL,
	`requesterName` varchar(255) NOT NULL,
	`requesterEmail` varchar(320) NOT NULL,
	`requesterPhone` varchar(50),
	`requesterOrganization` varchar(255),
	`requesterRole` varchar(100),
	`message` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`teacherResponse` text,
	`contactInfoRevealed` boolean NOT NULL DEFAULT false,
	`teacherNotifiedAt` timestamp,
	`adminNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connection_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `golden_samples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('lesson_plan','exam','drama_script','digitized_doc','marketplace_item') NOT NULL,
	`itemId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`subject` varchar(100),
	`grade` varchar(50),
	`thumbnailUrl` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `golden_samples_id` PRIMARY KEY(`id`)
);
