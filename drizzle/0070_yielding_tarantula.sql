CREATE TABLE `repartition_journaliere` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unite_number` int NOT NULL,
	`module_number` int NOT NULL,
	`journee_number` int NOT NULL,
	`niveau` varchar(50) NOT NULL DEFAULT '6ème année',
	`date_from` varchar(50),
	`date_to` varchar(50),
	`activities` json,
	`generated_content` mediumtext,
	`pdf_url` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repartition_journaliere_id` PRIMARY KEY(`id`)
);
