SELECT
    (SELECT COUNT(*) FROM section_progress_history) AS historyCount,
    (
        SELECT COUNT(*)
        FROM section_progress
        WHERE userId = 'student-user'
    ) AS currentCount;
