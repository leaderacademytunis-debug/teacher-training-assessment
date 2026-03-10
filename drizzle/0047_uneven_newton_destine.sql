CREATE TABLE `career_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherUserId` int NOT NULL,
	`schoolId` int NOT NULL,
	`schoolUserId` int NOT NULL,
	`jobPostingId` int,
	`status` enum('active','archived','blocked') NOT NULL DEFAULT 'active',
	`lastMessageAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderUserId` int NOT NULL,
	`content` text NOT NULL,
	`isFiltered` boolean DEFAULT false,
	`filteredContent` text,
	`messageType` enum('text','system','task_request','task_response') NOT NULL DEFAULT 'text',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digital_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`schoolUserId` int NOT NULL,
	`teacherUserId` int NOT NULL,
	`jobPostingId` int,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`topic` varchar(200) NOT NULL,
	`taskType` enum('lesson_plan','exam','drama_script','free_form') NOT NULL DEFAULT 'lesson_plan',
	`deadline` timestamp,
	`status` enum('pending','in_progress','submitted','reviewed','expired') NOT NULL DEFAULT 'pending',
	`responseContent` text,
	`responseUrl` varchar(1000),
	`schoolFeedback` text,
	`schoolRating` int,
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digital_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherUserId` int NOT NULL,
	`eventType` enum('profile_view','cv_download','smart_match','contact_click') NOT NULL,
	`visitorInfo` varchar(500),
	`jobPostingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_analytics_id` PRIMARY KEY(`id`)
);
