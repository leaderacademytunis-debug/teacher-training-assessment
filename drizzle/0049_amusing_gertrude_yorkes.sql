CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`type` enum('lesson_plan','exam','evaluation','free_form') NOT NULL DEFAULT 'lesson_plan',
	`dueDate` timestamp,
	`maxScore` int NOT NULL DEFAULT 100,
	`rubric` json,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_feature_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` int NOT NULL,
	`featureKey` varchar(100) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_feature_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(20) DEFAULT '#3B82F6',
	`icon` varchar(50) DEFAULT 'users',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`userId` int NOT NULL,
	`content` mediumtext,
	`fileUrl` varchar(500),
	`aiScore` int,
	`aiGrade` enum('excellent','good','acceptable','needs_improvement','insufficient'),
	`aiFeedback` mediumtext,
	`aiRubricScores` json,
	`masteryScore` int,
	`status` enum('draft','submitted','grading','graded','returned') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`gradedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
