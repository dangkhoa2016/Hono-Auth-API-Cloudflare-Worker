-- sqlite compatibility
SELECT * FROM Users;
delete from Users;

-- reset id primary key
DELETE FROM sqlite_sequence WHERE name='Users';

-- check reset id primary key
SELECT * FROM sqlite_sequence WHERE name='Users';

-- get current auto increment value
SELECT seq FROM sqlite_sequence WHERE name='Users';

-- list all tables
SELECT name FROM sqlite_master WHERE type='table';

-- list all indexes
SELECT name FROM sqlite_master WHERE type='index';

-- display version
SELECT sqlite_version();
