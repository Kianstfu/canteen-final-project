-- add-email-column.sql
-- I-import ito sa phpMyAdmin (XAMPP), kagaya ng add-image-column.sql,
-- para gumana ang "Continue with Google" sa customer login.
--
-- Bago ito: walang "email" column ang customers table, at required
-- (NOT NULL) ang password — kaya nag-e-error yung Google sign-in dahil
-- walang password ang mga Google account.

ALTER TABLE customers ADD COLUMN email VARCHAR(100) NULL UNIQUE AFTER username;
ALTER TABLE customers MODIFY password VARCHAR(255) NULL;
