CREATE TABLE `objectives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`outcomeId` int NOT NULL,
	`text` text NOT NULL,
	`domain` enum('cognitive','skill','affective') NOT NULL,
	`bloomLevel` varchar(100),
	`actionVerb` varchar(100),
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `objectives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` MODIFY COLUMN `level` enum('bachelor','masters','diploma','doctorate') NOT NULL DEFAULT 'bachelor';