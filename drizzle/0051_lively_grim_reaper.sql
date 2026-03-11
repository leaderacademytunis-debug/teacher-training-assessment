ALTER TABLE `batches` ADD `inviteCode` varchar(32);--> statement-breakpoint
ALTER TABLE `batches` ADD CONSTRAINT `batches_inviteCode_unique` UNIQUE(`inviteCode`);