create table boards (
    id SERIAL,
    identifier UUID,
    name varchar DEFAULT 'New board'
);

create table widgets (
    id SERIAL,
    type INTEGER,
    state JSON
);