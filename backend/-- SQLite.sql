CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'admin', 'hr', 'instructor'
    is_verified BOOLEAN DEFAULT 0  -- 0 for not verified, 1 for verified
);
