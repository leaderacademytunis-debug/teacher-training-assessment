CREATE TABLE `submission_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`role` enum('instructor','participant') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submission_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('enrollment_request','enrollment_approved','enrollment_rejected','new_video','exam_result','marketplace_rating','marketplace_download','marketplace_review','assignment_graded','assignment_returned','submission_comment') NOT NULL;