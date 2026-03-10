CREATE TABLE `curriculum_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`planTitle` varchar(255) NOT NULL,
	`totalPeriods` int NOT NULL DEFAULT 6,
	`totalTopics` int NOT NULL DEFAULT 0,
	`sourceDocumentUrl` text,
	`isOfficial` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `curriculum_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curriculum_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`periodNumber` int NOT NULL,
	`periodName` varchar(100),
	`weekNumber` int,
	`topicTitle` varchar(255) NOT NULL,
	`competency` varchar(255),
	`competencyCode` varchar(50),
	`objectives` text,
	`textbookName` varchar(255),
	`textbookPages` varchar(100),
	`sessionCount` int DEFAULT 1,
	`sessionDuration` int DEFAULT 45,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curriculum_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_curriculum_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`topicId` int NOT NULL,
	`status` enum('not_started','in_progress','completed','skipped') NOT NULL DEFAULT 'not_started',
	`linkedLessonPlanId` int,
	`linkedExamId` int,
	`linkedEvaluationId` int,
	`teacherNotes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacher_curriculum_progress_id` PRIMARY KEY(`id`)
);
