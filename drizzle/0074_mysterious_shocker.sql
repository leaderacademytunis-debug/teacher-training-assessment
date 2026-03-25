ALTER TABLE `job_postings` ADD `minExperience` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `job_postings` ADD `maxExperience` int;--> statement-breakpoint
ALTER TABLE `job_postings` ADD `requiredLanguages` json;--> statement-breakpoint
ALTER TABLE `job_postings` ADD `preferredMethodologies` json;--> statement-breakpoint
ALTER TABLE `job_postings` ADD `requiresCertification` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `job_postings` ADD `urgencyLevel` enum('normal','urgent','immediate') DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `availabilityStatus` enum('available','open_to_offers','not_available') DEFAULT 'open_to_offers';--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `preferredContractTypes` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `preferredRegions` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `languages` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `certificationNames` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `teachingMethodologies` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `additionalSkills` json;--> statement-breakpoint
ALTER TABLE `teacher_portfolios` ADD `willingToRelocate` boolean DEFAULT false;