CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`setting_type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`category` varchar(50) NOT NULL DEFAULT 'general',
	`label_ar` varchar(255),
	`label_fr` varchar(255),
	`label_en` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_settings_setting_key_unique` UNIQUE(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `platform_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_key` varchar(100) NOT NULL,
	`content_ar` text,
	`content_fr` text,
	`content_en` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`display_location` varchar(100),
	`message_type` enum('info','warning','success','promo') NOT NULL DEFAULT 'info',
	`start_date` timestamp,
	`end_date` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_messages_message_key_unique` UNIQUE(`message_key`)
);
--> statement-breakpoint
CREATE TABLE `tool_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tool_key` varchar(100) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`name_fr` varchar(255),
	`name_en` varchar(255),
	`description_ar` text,
	`icon` varchar(50) DEFAULT 'Sparkles',
	`is_enabled` boolean NOT NULL DEFAULT true,
	`requires_auth` boolean NOT NULL DEFAULT true,
	`free_access` boolean NOT NULL DEFAULT false,
	`pro_access` boolean NOT NULL DEFAULT true,
	`premium_access` boolean NOT NULL DEFAULT true,
	`free_limit_per_month` int NOT NULL DEFAULT 0,
	`pro_limit_per_month` int NOT NULL DEFAULT 0,
	`premium_limit_per_month` int NOT NULL DEFAULT 0,
	`free_image_limit` int NOT NULL DEFAULT 0,
	`pro_image_limit` int NOT NULL DEFAULT 0,
	`premium_image_limit` int NOT NULL DEFAULT 0,
	`max_file_upload_mb` int NOT NULL DEFAULT 10,
	`sort_order` int NOT NULL DEFAULT 0,
	`category` varchar(50) DEFAULT 'ai_tools',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_configurations_id` PRIMARY KEY(`id`),
	CONSTRAINT `tool_configurations_tool_key_unique` UNIQUE(`tool_key`)
);
--> statement-breakpoint
CREATE TABLE `tool_usage_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tool_key` varchar(100) NOT NULL,
	`month_year` varchar(7) NOT NULL,
	`operation_count` int NOT NULL DEFAULT 0,
	`image_count` int NOT NULL DEFAULT 0,
	`file_upload_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_usage_tracking_id` PRIMARY KEY(`id`)
);
