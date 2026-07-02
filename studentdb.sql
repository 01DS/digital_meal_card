CREATE TABLE students (
  student_id VARCHAR(20) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active'
);
