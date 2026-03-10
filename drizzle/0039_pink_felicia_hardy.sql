CREATE TABLE `gradingSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`sessionTitle` varchar(255) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`grade` varchar(50) NOT NULL,
	`examType` enum('formative','summative','diagnostic') NOT NULL DEFAULT 'summative',
	`linkedExamId` int,
	`correctionKey` json,
	`hideStudentNames` boolean NOT NULL DEFAULT true,
	`status` enum('draft','in_progress','completed') NOT NULL DEFAULT 'draft',
	`totalStudents` int NOT NULL DEFAULT 0,
	`gradedStudents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gradingSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`studentName` varchar(255),
	`studentNumber` int,
	`imageUrl` text NOT NULL,
	`imageKey` text NOT NULL,
	`extractedText` text,
	`ocrConfidence` varchar(20),
	`criteriaScores` json,
	`totalSuggestedScore` int,
	`totalFinalScore` int,
	`overallMasteryLevel` varchar(10),
	`feedbackStrengths` text,
	`feedbackImprovements` text,
	`status` enum('uploaded','ocr_done','ai_graded','teacher_reviewed','finalized') NOT NULL DEFAULT 'uploaded',
	`teacherNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentSubmissions_id` PRIMARY KEY(`id`)
);
