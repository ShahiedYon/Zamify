CREATE TABLE `poll_votes` (
	`voter_id` text PRIMARY KEY NOT NULL,
	`certification_id` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `poll_votes_certification_idx` ON `poll_votes` (`certification_id`);