CREATE TABLE `lessonPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`planTitle` varchar(255) NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`totalLessons` int,
	`lessons` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessonPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedagogicalSheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`lessonTitle` varchar(255) NOT NULL,
	`lessonObjectives` text,
	`duration` int,
	`materials` text,
	`introduction` text,
	`mainActivities` json,
	`conclusion` text,
	`evaluation` text,
	`guidePageReference` varchar(100),
	`programReference` text,
	`status` enum('draft','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedagogicalSheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referenceDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploadedBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50),
	`subject` varchar(100),
	`documentType` enum('teacher_guide','official_program','other') NOT NULL,
	`documentTitle` varchar(255) NOT NULL,
	`documentUrl` text NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referenceDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacherExams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`educationLevel` enum('primary','middle','secondary') NOT NULL,
	`grade` varchar(50) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`examTitle` varchar(255) NOT NULL,
	`examType` enum('formative','summative','diagnostic') NOT NULL,
	`duration` int,
	`totalPoints` int NOT NULL DEFAULT 20,
	`questions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacherExams_id` PRIMARY KEY(`id`)
);
