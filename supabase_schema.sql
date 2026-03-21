-- Create the `card_ratings` table
CREATE TABLE card_ratings (
  card_id TEXT PRIMARY KEY,
  total_score INTEGER NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 0,
  average_score REAL NOT NULL DEFAULT 0
);

-- Create the `card_elo` table
CREATE TABLE card_elo (
  card_id TEXT PRIMARY KEY,
  elo_score INTEGER NOT NULL DEFAULT 1200
);

-- Optional: Set up Row Level Security (RLS)
-- For this prototype, we will allow anonymous access for reading and writing

ALTER TABLE card_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON card_ratings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON card_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON card_ratings FOR UPDATE USING (true);


ALTER TABLE card_elo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON card_elo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON card_elo FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON card_elo FOR UPDATE USING (true);
