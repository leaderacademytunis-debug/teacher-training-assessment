CREATE TABLE `ai_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`activityType` enum('lesson_plan','exam_generated','evaluation','image_generated','inspection_report') NOT NULL,
	`title` varchar(500),
	`subject` varchar(100),
	`level` varchar(100),
	`contentPreview` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestedService` enum('edugpt_pro','course_ai','course_pedagogy','full_bundle') NOT NULL,
	`receiptImageUrl` text NOT NULL,
	`amount` decimal(10,2),
	`currency` varchar(10) DEFAULT 'TND',
	`paymentMethod` varchar(50),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`activatedServices` json,
	`userNote` text,
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`access_edugpt` boolean NOT NULL DEFAULT false,
	`access_course_ai` boolean NOT NULL DEFAULT false,
	`access_course_pedagogy` boolean NOT NULL DEFAULT false,
	`access_full_bundle` boolean NOT NULL DEFAULT false,
	`tier` enum('free','pro','premium') NOT NULL DEFAULT 'free',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_permissions_id` PRIMARY KEY(`id`)
);
