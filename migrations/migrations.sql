create table boards (
    id SERIAL,
    identifier UUID,
    name VARCHAR DEFAULT 'Your project name'
);

create table widgets (
    id SERIAL,
    board_id INTEGER,
    type INTEGER,
    state JSON
);
