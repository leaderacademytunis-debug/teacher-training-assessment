CREATE TABLE `referral_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralId` int NOT NULL,
	`userId` int NOT NULL,
	`rewardType` enum('referrer_bonus','referred_bonus') NOT NULL,
	`creditsAwarded` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`status` enum('pending','awarded','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`awardedAt` timestamp,
	CONSTRAINT `referral_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int,
	`referredEmail` varchar(320) NOT NULL,
	`referralCode` varchar(50) NOT NULL,
	`referralLink` text NOT NULL,
	`status` enum('pending','accepted','completed','expired') NOT NULL DEFAULT 'pending',
	`referrerRewardCredits` int NOT NULL DEFAULT 10,
	`referredRewardCredits` int NOT NULL DEFAULT 5,
	`rewardClaimed` boolean NOT NULL DEFAULT false,
	`rewardClaimedAt` timestamp,
	`invitationMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
