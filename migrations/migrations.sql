create table boards (
    id SERIAL,
    identifier UUID,
    name VARCHAR DEFAULT 'New board'
);

create table widgets (
    id SERIAL,
    board_id INTEGER,
    type INTEGER,
    name VARCHAR DEFAULT 'New widget',
    state JSON
);