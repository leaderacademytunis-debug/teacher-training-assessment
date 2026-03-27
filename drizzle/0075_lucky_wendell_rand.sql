CREATE TABLE `textbook_excerpts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`source_file_name` varchar(255),
	`source_page_number` int,
	`book_id` varchar(100),
	`book_title` varchar(255),
	`title` varchar(255),
	`notes` text,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `textbook_excerpts_id` PRIMARY KEY(`id`)
);
