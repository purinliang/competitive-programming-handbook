CREATE TABLE api_rate_limits (
    scopeKey TEXT NOT NULL,
    action TEXT NOT NULL,
    windowStart INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY (scopeKey, action)
);

CREATE INDEX api_rate_limits_window_idx
ON api_rate_limits(windowStart);
