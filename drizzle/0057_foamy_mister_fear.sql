CREATE TABLE `handwritingAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`studentId` int,
	`studentName` varchar(100),
	`studentAge` int,
	`studentGrade` varchar(50),
	`imageUrl` text NOT NULL,
	`writingType` enum('copy','dictation','free_expression','math') NOT NULL DEFAULT 'copy',
	`teacherNotes` text,
	`overallScore` int,
	`letterFormationScore` int,
	`sizeProportionScore` int,
	`spacingOrganizationScore` int,
	`baselineScore` int,
	`reversalsScore` int,
	`pressureSpeedScore` int,
	`consistencyScore` int,
	`disorders` json,
	`analysisReport` mediumtext,
	`recommendations` mediumtext,
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `handwritingAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`age` int NOT NULL,
	`grade` varchar(50) NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentProfiles_id` PRIMARY KEY(`id`)
);
