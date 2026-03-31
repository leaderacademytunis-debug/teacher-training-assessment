ALTER TABLE `teacher_portfolios` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `subject` varchar(100);--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `teachingLevel` enum('primary','middle','secondary');--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `isAvailableForJobs` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `profileCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `lessonsCreated` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `videosCreated` int DEFAULT 0 NOT NULL;