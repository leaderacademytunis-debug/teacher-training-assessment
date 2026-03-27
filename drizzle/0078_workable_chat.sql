ALTER TABLE `studio_projects` ADD `studio_type` enum('edu_studio','ultimate_studio') DEFAULT 'edu_studio' NOT NULL;--> statement-breakpoint
ALTER TABLE `studio_projects` ADD `pdf_url` text;--> statement-breakpoint
ALTER TABLE `studio_projects` ADD `pdf_file_name` varchar(255);--> statement-breakpoint
ALTER TABLE `studio_projects` ADD `current_page` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `studio_projects` ADD `extracted_text` mediumtext;--> statement-breakpoint
ALTER TABLE `studio_projects` ADD `script_content` mediumtext;