INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES
    ('student-user', 'Student User', 'student@example.com', 1, 1, 1),
    ('other-user', 'Other Student', 'other@example.com', 1, 1, 1),
    ('admin-user', 'Admin User', 'admin@example.com', 1, 1, 1);

INSERT INTO user_roles (userId, role, updatedAt) VALUES
    ('student-user', 'student', 1),
    ('other-user', 'student', 1),
    ('admin-user', 'admin', 1);

INSERT INTO session (id, expiresAt, token, createdAt, updatedAt, userId) VALUES
    ('student-session', 1999999999999, 'student-token', 1, 1, 'student-user'),
    ('other-session', 1999999999999, 'other-token', 1, 1, 'other-user'),
    ('admin-session', 1999999999999, 'admin-token', 1, 1, 'admin-user');

INSERT INTO discussion_threads (
    id, userId, documentKey, documentEpoch, targetKind, targetId,
    targetRevision, targetTitle, quotedText, visibility, anonymous,
    status, createdAt, updatedAt
) VALUES (
    'orphan-thread', 'other-user', 'learning-path:cpp/a-plus-b-problem', 1,
    'section', 'removed-section', 'removed-revision', '已经删除的小节',
    '旧版引用', 'public', 0, 'open', 2, 2
), (
    'old-epoch-thread', 'other-user', 'learning-path:cpp/a-plus-b-problem', 0,
    'article', 'article', 'old-content-revision', '全文',
    NULL, 'public', 0, 'open', 1, 1
);

INSERT INTO discussion_comments (
    id, threadId, userId, parentCommentId, body, status,
    createdAt, updatedAt, anonymous
) VALUES (
    'orphan-comment', 'orphan-thread', 'other-user', NULL,
    '保留下来的历史讨论', 'visible', 2, 2, 0
), (
    'old-epoch-comment', 'old-epoch-thread', 'other-user', NULL,
    '整篇换代前的历史讨论', 'visible', 1, 1, 0
);
