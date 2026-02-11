CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`messageAr` text NOT NULL,
	`type` enum('enrollment_request','enrollment_approved','enrollment_rejected','new_video','exam_result') NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
