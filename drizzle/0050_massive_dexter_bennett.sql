CREATE TABLE `assignment_classroom_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`mappingId` int NOT NULL,
	`googleCourseWorkId` varchar(255) NOT NULL,
	`lastGradeSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assignment_classroom_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_classroom_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` int NOT NULL,
	`connectionId` int NOT NULL,
	`googleCourseId` varchar(255) NOT NULL,
	`googleCourseName` varchar(500),
	`syncAssignments` boolean NOT NULL DEFAULT true,
	`syncGrades` boolean NOT NULL DEFAULT true,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_classroom_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classroom_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`action` enum('push_assignment','sync_grades','pull_roster','full_sync') NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`details` text,
	`errorMessage` text,
	`itemsProcessed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `classroom_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_classroom_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`googleEmail` varchar(255) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`tokenExpiresAt` timestamp,
	`scopes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_classroom_connections_id` PRIMARY KEY(`id`)
);
