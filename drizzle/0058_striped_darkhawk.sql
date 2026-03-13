CREATE TABLE `interventionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`studentId` int,
	`studentName` varchar(100) NOT NULL,
	`studentAge` int,
	`studentGrade` varchar(50),
	`handwritingAnalysisId` int,
	`voiceAnalysisId` int,
	`diagnosis` mediumtext,
	`objectives` json,
	`interventions` mediumtext,
	`classroomAdaptations` mediumtext,
	`homeActivities` mediumtext,
	`followUpSchedule` json,
	`teacherName` varchar(200),
	`specialistName` varchar(200),
	`parentName` varchar(200),
	`status` enum('draft','active','completed','archived') NOT NULL DEFAULT 'draft',
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interventionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialistContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`specialty` enum('orthophonist','psychologist','occupational_therapist','other') NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`schoolName` varchar(200),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialistContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapeuticExercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`descriptionAr` mediumtext NOT NULL,
	`descriptionFr` mediumtext,
	`targetDisorder` enum('dysgraphia','dyslexia','adhd','asd','general') NOT NULL,
	`targetAxis` enum('letterFormation','sizeProportion','spacingOrganization','baseline','reversals','pressureSpeed','consistency','general') NOT NULL,
	`exerciseType` enum('motor','visual','cognitive','classroom_adaptation','home_activity') NOT NULL DEFAULT 'motor',
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
	`minAge` int DEFAULT 5,
	`maxAge` int DEFAULT 12,
	`durationMinutes` int DEFAULT 15,
	`materials` text,
	`instructions` mediumtext,
	`isPrintable` boolean DEFAULT false,
	`printableUrl` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `therapeuticExercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voiceAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`handwritingAnalysisId` int,
	`studentId` int,
	`studentName` varchar(100),
	`audioUrl` text NOT NULL,
	`transcription` mediumtext,
	`fluencyScore` int,
	`pronunciationScore` int,
	`readingSpeedScore` int,
	`comprehensionScore` int,
	`voiceReport` mediumtext,
	`voiceRecommendations` mediumtext,
	`combinedReport` mediumtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voiceAnalyses_id` PRIMARY KEY(`id`)
);
