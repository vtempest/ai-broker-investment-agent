-- Fix wallet_addresses schema to match better-auth SIWE plugin expectations
-- 1. Rename wallet_address column to address
ALTER TABLE `wallet_addresses` RENAME COLUMN `wallet_address` TO `address`;--> statement-breakpoint
-- 2. Drop old unique index
DROP INDEX IF EXISTS `wallet_addresses_wallet_address_unique`;--> statement-breakpoint
-- 3. Create new unique index on address column
CREATE UNIQUE INDEX `wallet_addresses_address_unique` ON `wallet_addresses` (`address`);--> statement-breakpoint
-- 4. Make chain_id column NOT NULL (better-auth requires this)
-- First, update any NULL values to a default (1 for Ethereum mainnet)
UPDATE `wallet_addresses` SET `chain_id` = 1 WHERE `chain_id` IS NULL;--> statement-breakpoint
-- 5. Drop the updated_at column (not used by better-auth)
ALTER TABLE `wallet_addresses` DROP COLUMN `updated_at`;
