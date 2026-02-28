CREATE TABLE `shared_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`userName` text,
	`noteGlobale` decimal(4,2) NOT NULL,
	`appreciation` varchar(100) NOT NULL,
	`evaluationData` json NOT NULL,
	`fileName` varchar(255),
	`subject` varchar(100),
	`level` varchar(100),
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `shared_evaluations_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_evaluations_token_unique` UNIQUE(`token`)
);
