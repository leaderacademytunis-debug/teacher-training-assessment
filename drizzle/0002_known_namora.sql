CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`examAttemptId` int NOT NULL,
	`certificateNumber` varchar(50) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`pdfUrl` text,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
