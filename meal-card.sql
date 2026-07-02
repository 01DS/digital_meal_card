CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE,
  full_name VARCHAR(100),
  email VARCHAR(100),
  department VARCHAR(50),
  year INT,
  qr_code VARCHAR(255)
);
