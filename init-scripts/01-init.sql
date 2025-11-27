-- Initial database setup for InterviewAI
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tables (will be created by JPA/Hibernate)
-- This file is here for any manual initialization if needed
-- The actual schema will be created by Spring Boot JPA with hibernate.ddl-auto=update

-- You can add more initialization scripts here
-- PostgreSQL will run all .sql files in alphabetical order
