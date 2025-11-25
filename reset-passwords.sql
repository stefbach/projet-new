-- Reset passwords for all doctors to 'password123'
-- SHA-256 hash for 'password123': ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

UPDATE doctors 
SET password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

SELECT 'Passwords updated for ' || changes() || ' doctors' as message;
