CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`outcomeId` int,
	`title` varchar(255) NOT NULL,
	`type` enum('project','discussion','quiz','practical','presentation','research') NOT NULL,
	`description` text,
	`duration` varchar(100),
	`instructions` text,
	`isSelected` int DEFAULT 0,
	`isAiGenerated` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`courseCode` varchar(50),
	`level` enum('bachelor','masters','diploma') NOT NULL DEFAULT 'bachelor',
	`description` text,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`text` text NOT NULL,
	`domain` enum('cognitive','skill','value') NOT NULL,
	`bloomLevel` varchar(100),
	`actionVerb` varchar(100),
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rubrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`criteria` json NOT NULL,
	`totalPoints` int DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rubrics_id` PRIMARY KEY(`id`)
);
