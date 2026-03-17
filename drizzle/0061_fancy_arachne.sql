ALTER TABLE `courses` MODIFY COLUMN `category` enum('primary_teachers','arabic_teachers','science_teachers','french_teachers','preschool_facilitators','special_needs_companions','digital_teacher_ai','bundle') NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `descriptionShortAr` varchar(500);--> statement-breakpoint
ALTER TABLE `courses` ADD `coverImageUrl` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `price` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `courses` ADD `originalPrice` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `isBundle` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `bundleCourseIds` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `schedule` varchar(255);--> statement-breakpoint
ALTER TABLE `courses` ADD `isFeatured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `sortOrder` int DEFAULT 0;