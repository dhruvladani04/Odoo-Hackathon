
-- Fix the foreign key constraints in the swaps table to properly reference profiles
ALTER TABLE public.swaps 
DROP CONSTRAINT IF EXISTS swaps_provider_id_fkey,
DROP CONSTRAINT IF EXISTS swaps_requester_id_fkey;

-- Add correct foreign key constraints that reference profiles.user_id instead of profiles.id
ALTER TABLE public.swaps
ADD CONSTRAINT swaps_provider_id_fkey 
FOREIGN KEY (provider_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
ADD CONSTRAINT swaps_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
