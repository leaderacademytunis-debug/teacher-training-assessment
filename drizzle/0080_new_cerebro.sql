ALTER TABLE `service_permissions` ADD `giftBonusDays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `lastGiftAt` timestamp;--> statement-breakpoint
ALTER TABLE `service_permissions` ADD `lastGiftSeenAt` timestamp;