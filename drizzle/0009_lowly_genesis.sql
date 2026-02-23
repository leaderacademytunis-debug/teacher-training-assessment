ALTER TABLE `users` ADD `firstNameAr` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastNameAr` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `firstNameFr` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastNameFr` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `idCardNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `paymentReceiptUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `registrationCompleted` boolean DEFAULT false NOT NULL;