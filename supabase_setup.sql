-- Supabase Database Setup Script for Pokémon Card Rater
-- Please copy and paste everything below into the Supabase SQL Editor and click "Run"

-- 1. Create the Card Ratings Table
CREATE TABLE IF NOT EXISTS public.card_ratings (
  card_id TEXT PRIMARY KEY,
  total_score REAL NOT NULL,
  count INTEGER NOT NULL,
  average_score REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Card Elo (Versus) Table
CREATE TABLE IF NOT EXISTS public.card_elo (
  card_id TEXT PRIMARY KEY,
  elo_score REAL NOT NULL DEFAULT 1200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.card_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_elo ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies to allow anonymous reads and writes (Necessary for public game sites)

-- For card_ratings
CREATE POLICY "Allow public read access to card_ratings"
ON public.card_ratings FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert to card_ratings"
ON public.card_ratings FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow public update to card_ratings"
ON public.card_ratings FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- For card_elo
CREATE POLICY "Allow public read access to card_elo"
ON public.card_elo FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow public insert to card_elo"
ON public.card_elo FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow public update to card_elo"
ON public.card_elo FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
