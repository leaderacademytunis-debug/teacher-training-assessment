ALTER TABLE `infographics` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `mindMaps` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `infographics` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `mindMaps` DROP COLUMN `userId`;