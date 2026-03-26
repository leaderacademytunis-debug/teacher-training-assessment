ALTER TABLE `reference_content` MODIFY COLUMN `niveau` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `reference_content` ADD `sous_theme` varchar(255);--> statement-breakpoint
ALTER TABLE `reference_content` ADD `activities` json NOT NULL;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `comm_orale_objet`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `comm_orale_objectif`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `comm_orale_remarques`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `lecture_objet`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `lecture_objectif`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `lecture_remarques`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `grammaire_type`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `grammaire_objet`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `grammaire_objectif`;--> statement-breakpoint
ALTER TABLE `reference_content` DROP COLUMN `grammaire_remarques`;