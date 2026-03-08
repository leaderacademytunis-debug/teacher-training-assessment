CREATE TABLE `pricing_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceKey` varchar(100) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`description` text,
	`price` int NOT NULL DEFAULT 0,
	`currency` varchar(10) NOT NULL DEFAULT 'TND',
	`billingPeriod` enum('monthly','quarterly','yearly','lifetime') NOT NULL DEFAULT 'monthly',
	`features` text,
	`isPopular` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`badgeText` varchar(100),
	`color` varchar(50) DEFAULT 'blue',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_plans_id` PRIMARY KEY(`id`)
);
