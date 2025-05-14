-- Create admins table
CREATE TABLE admins (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL
);

-- Create visitors table
CREATE TABLE visitors (
                          id SERIAL PRIMARY KEY,
                          visitor_number VARCHAR(4) UNIQUE NOT NULL,
                          full_name VARCHAR(100) NOT NULL,
                          apartment_number VARCHAR(20) NOT NULL,
                          vehicle_info VARCHAR(100),
                          purpose VARCHAR(255) NOT NULL,
                          visit_duration VARCHAR(50) NOT NULL,
                          in_time TIMESTAMP NOT NULL,
                          expected_out_time TIMESTAMP NOT NULL,
                          actual_out_time TIMESTAMP
);

-- Insert a default admin (password: 'admin123' in plain text)
INSERT INTO admins (username, password)
VALUES ('admin', 'admin123');
