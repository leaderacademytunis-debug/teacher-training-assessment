CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetUserId` int,
	`targetType` varchar(50),
	`changes` text,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalCredits` int NOT NULL DEFAULT 0,
	`usedCredits` int NOT NULL DEFAULT 0,
	`remainingCredits` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `user_credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_credits_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','basic','pro','vip') NOT NULL DEFAULT 'free',
	`status` enum('active','inactive','suspended','expired') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_subscriptions_userId_unique` UNIQUE(`userId`)
);
