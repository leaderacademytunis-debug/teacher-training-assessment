CREATE TABLE `saved_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`subject` varchar(100),
	`level` varchar(100),
	`trimester` varchar(50),
	`evaluationType` varchar(50),
	`schoolYear` varchar(20),
	`schoolName` varchar(255),
	`teacherName` varchar(255),
	`totalPoints` int DEFAULT 20,
	`variant` varchar(10) DEFAULT 'A',
	`evaluationData` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_evaluations_id` PRIMARY KEY(`id`)
);
