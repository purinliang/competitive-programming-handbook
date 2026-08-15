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
