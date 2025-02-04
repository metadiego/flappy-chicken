CREATE TABLE high_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_score ON high_scores (score DESC);
CREATE INDEX idx_created_at ON high_scores (created_at DESC);
