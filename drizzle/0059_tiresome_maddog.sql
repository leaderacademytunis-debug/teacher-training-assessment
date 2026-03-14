CREATE TABLE `handwritingWorksheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentName` varchar(200),
	`studentAge` int,
	`studentGrade` varchar(100),
	`targetAxes` json,
	`targetDisorders` json,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`title` varchar(300) NOT NULL,
	`exercises` json,
	`printableHtml` mediumtext,
	`pdfUrl` text,
	`analysisId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `handwritingWorksheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthlyProgressReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`totalAnalyses` int DEFAULT 0,
	`totalStudents` int DEFAULT 0,
	`avgScore` int DEFAULT 0,
	`studentSummaries` json,
	`axisAverages` json,
	`disorderAlerts` json,
	`summary` mediumtext,
	`recommendations` mediumtext,
	`pdfUrl` text,
	`emailSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthlyProgressReports_id` PRIMARY KEY(`id`)
);
