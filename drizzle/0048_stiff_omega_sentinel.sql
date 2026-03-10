CREATE TABLE `job_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobPostingId` int NOT NULL,
	`teacherUserId` int NOT NULL,
	`schoolId` int NOT NULL,
	`showcaseLink` varchar(500),
	`coverMessage` text,
	`status` enum('sent','viewed','shortlisted','interviewed','accepted','rejected') NOT NULL DEFAULT 'sent',
	`matchScore` int,
	`schoolNotes` text,
	`viewedAt` timestamp,
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smart_match_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherUserId` int NOT NULL,
	`jobPostingId` int NOT NULL,
	`matchScore` int NOT NULL,
	`matchDetails` json,
	`notificationType` enum('in_app','email','both') NOT NULL DEFAULT 'both',
	`isRead` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smart_match_notifications_id` PRIMARY KEY(`id`)
);
