ALTER TABLE discussion_comments
ADD COLUMN anonymous INTEGER NOT NULL DEFAULT 0 CHECK (anonymous IN (0, 1));
