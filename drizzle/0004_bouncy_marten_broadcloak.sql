ALTER TABLE `enrollments` MODIFY COLUMN `status` enum('pending','approved','rejected','active','completed','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `enrollments` ADD `approvedBy` int;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `approvedAt` timestamp;