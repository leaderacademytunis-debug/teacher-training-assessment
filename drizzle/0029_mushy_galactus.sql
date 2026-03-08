CREATE TABLE `saved_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`level` varchar(100) NOT NULL,
	`trimester` varchar(50) NOT NULL,
	`duration` varchar(30),
	`totalScore` int DEFAULT 20,
	`topics` text,
	`examContent` text NOT NULL,
	`answerKeyContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_exams_id` PRIMARY KEY(`id`)
);
