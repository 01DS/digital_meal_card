-- Schema for Meal Card System
CREATE DATABASE IF NOT EXISTS meal_card_system;
USE meal_card_system;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('staff','admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  program VARCHAR(100) NOT NULL,
  cafeteria_status ENUM('cafeteria','non-cafeteria') DEFAULT 'cafeteria',
  year INT NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(30),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  qr_code VARCHAR(255) NOT NULL UNIQUE,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  staff_id INT NOT NULL,
  meal_type ENUM('breakfast','lunch','dinner') NOT NULL,
  used_at DATETIME NOT NULL,
  FOREIGN KEY (card_id) REFERENCES meal_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_meal_logs_card_id ON meal_logs(card_id);
CREATE INDEX idx_meal_logs_used_at ON meal_logs(used_at);
CREATE INDEX idx_meal_logs_type ON meal_logs(meal_type);
