CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`pageUrl` varchar(255) NOT NULL,
	`pageTitle` varchar(255),
	`eventType` varchar(50) NOT NULL,
	`referrer` text,
	`userAgent` text,
	`ipAddress` varchar(45),
	`sessionId` varchar(100),
	`duration` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
