-- Initialize the database
CREATE DATABASE IF NOT EXISTS ielts_mock_test;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ielts_user') THEN
        CREATE ROLE ielts_user WITH LOGIN PASSWORD 'ielts_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ielts_mock_test TO ielts_user;
GRANT ALL ON SCHEMA public TO ielts_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ielts_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ielts_user;
