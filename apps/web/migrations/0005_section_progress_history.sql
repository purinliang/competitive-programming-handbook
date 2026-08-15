CREATE TABLE section_progress_history (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    documentKey TEXT NOT NULL,
    documentEpoch INTEGER NOT NULL,
    sectionId TEXT NOT NULL,
    sectionRevision TEXT NOT NULL,
    readAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    archivedAt INTEGER NOT NULL
);

CREATE INDEX section_progress_history_user_idx
ON section_progress_history(
    userId,
    documentKey,
    documentEpoch,
    sectionId,
    archivedAt DESC
);
