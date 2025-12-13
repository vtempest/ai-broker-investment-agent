-- Add polymarket market positions table
CREATE TABLE `polymarket_market_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`outcome` text NOT NULL,
	`price` real NOT NULL,
	`size` real NOT NULL,
	`side` text NOT NULL,
	`total_value` real NOT NULL,
	`created_at` integer NOT NULL
);

-- Add polymarket debates table
CREATE TABLE `polymarket_debates` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL UNIQUE,
	`question` text NOT NULL,
	`yes_arguments` text NOT NULL,
	`no_arguments` text NOT NULL,
	`yes_summary` text NOT NULL,
	`no_summary` text NOT NULL,
	`key_factors` text NOT NULL,
	`uncertainties` text NOT NULL,
	`current_yes_price` real,
	`current_no_price` real,
	`llm_provider` text,
	`model` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

-- Create index for faster market lookups
CREATE INDEX `idx_market_positions_market_id` ON `polymarket_market_positions` (`market_id`);
CREATE INDEX `idx_debates_market_id` ON `polymarket_debates` (`market_id`);
