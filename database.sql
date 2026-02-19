-- ============================================
--  RAWAT PORTFOLIO — DATABASE SETUP
--  Run this in phpMyAdmin or MySQL CLI
--  Database: rawat_portfolio
-- ============================================

CREATE DATABASE IF NOT EXISTS rawat_portfolio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rawat_portfolio;

-- ── CONTACT MESSAGES TABLE ──────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    from_name   VARCHAR(100)  NOT NULL,
    from_email  VARCHAR(150)  NOT NULL,
    subject     VARCHAR(200)  NOT NULL,
    message     TEXT          NOT NULL,
    submitted_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    is_read     TINYINT(1)    DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TESTIMONIALS TABLE ───────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    role         VARCHAR(150) NOT NULL,
    message      TEXT         NOT NULL,
    rating       TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    submitted_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    is_approved  TINYINT(1)   DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── SAMPLE TESTIMONIAL (optional seed) ───────
INSERT INTO testimonials (name, role, message, rating) VALUES
('Ma. Clara Santos',  'Classmate — BSIT 2A',   'Janos is one of the most dedicated students I know. His attention to detail in projects is remarkable.', 5),
('Prof. Reyes',       'Web Development Faculty','A consistently hardworking student who goes beyond the minimum requirements. Great initiative.',          5),
('Rico Delgado',      'Group Mate',             'Always reliable and brings creative ideas to the table. Working with Janos on projects is a pleasure.',   4);
