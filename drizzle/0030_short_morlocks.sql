CREATE TABLE `generated_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` text NOT NULL,
	`prompt` text NOT NULL,
	`style` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_images_id` PRIMARY KEY(`id`)
);
