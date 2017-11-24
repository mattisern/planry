create table boards (
    id SERIAL,
    identifier UUID,
    name varchar DEFAULT 'New board'
);

create table widgets (
    id SERIAL,
    state JSON
);