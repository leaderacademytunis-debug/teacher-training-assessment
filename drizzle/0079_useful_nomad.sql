ALTER TABLE `service_permissions` MODIFY COLUMN `tier` enum('free','starter','pro','vip') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `access_voice_clone` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `access_ultimate_studio_full` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `access_priority_support` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `activatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `activatedBy` int;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `paymentMethod` varchar(50);