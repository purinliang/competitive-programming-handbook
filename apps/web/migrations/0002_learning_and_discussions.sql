PRAGMA foreign_keys = ON;

CREATE TABLE user_roles (
    userId TEXT PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    updatedAt INTEGER NOT NULL
);

CREATE TABLE section_progress (
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    documentKey TEXT NOT NULL,
    documentEpoch INTEGER NOT NULL,
    sectionId TEXT NOT NULL,
    sectionRevision TEXT NOT NULL,
    readAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    PRIMARY KEY (userId, documentKey, documentEpoch, sectionId)
);

CREATE INDEX section_progress_document_idx
ON section_progress(documentKey, documentEpoch, sectionId);

CREATE TABLE question_attempts (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    documentKey TEXT NOT NULL,
    documentEpoch INTEGER NOT NULL,
    questionId TEXT NOT NULL,
    questionRevision TEXT NOT NULL,
    selectedOptionId TEXT NOT NULL,
    correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
    createdAt INTEGER NOT NULL
);

CREATE INDEX question_attempts_latest_idx
ON question_attempts(userId, documentKey, documentEpoch, questionId, createdAt DESC);

CREATE TABLE discussion_threads (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    documentKey TEXT NOT NULL,
    documentEpoch INTEGER NOT NULL,
    targetKind TEXT NOT NULL CHECK (targetKind IN ('article', 'section')),
    targetId TEXT NOT NULL,
    targetRevision TEXT NOT NULL,
    targetTitle TEXT NOT NULL,
    quotedText TEXT,
    visibility TEXT NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'public')),
    anonymous INTEGER NOT NULL DEFAULT 0 CHECK (anonymous IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'locked', 'deleted')),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    deletedAt INTEGER
);

CREATE INDEX discussion_threads_target_idx
ON discussion_threads(documentKey, documentEpoch, targetKind, targetId, createdAt DESC);

CREATE INDEX discussion_threads_owner_idx
ON discussion_threads(userId, updatedAt DESC);

CREATE TABLE discussion_comments (
    id TEXT PRIMARY KEY NOT NULL,
    threadId TEXT NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    parentCommentId TEXT REFERENCES discussion_comments(id),
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visible'
        CHECK (status IN ('visible', 'deleted', 'hidden')),
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    deletedAt INTEGER
);

CREATE INDEX discussion_comments_thread_idx
ON discussion_comments(threadId, createdAt);

CREATE TABLE comment_reports (
    id TEXT PRIMARY KEY NOT NULL,
    commentId TEXT NOT NULL REFERENCES discussion_comments(id) ON DELETE CASCADE,
    reporterUserId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'resolved', 'dismissed')),
    createdAt INTEGER NOT NULL,
    resolvedAt INTEGER,
    UNIQUE (commentId, reporterUserId)
);

CREATE TABLE moderation_events (
    id TEXT PRIMARY KEY NOT NULL,
    moderatorUserId TEXT NOT NULL REFERENCES user(id),
    targetKind TEXT NOT NULL CHECK (targetKind IN ('thread', 'comment', 'report')),
    targetId TEXT NOT NULL,
    action TEXT NOT NULL,
    reason TEXT,
    createdAt INTEGER NOT NULL
);

CREATE INDEX moderation_events_target_idx
ON moderation_events(targetKind, targetId, createdAt);
