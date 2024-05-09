CREATE DATABASE IF NOT EXISTS `accounts`;

CREATE TABLE IF NOT EXISTS accounts.account_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_status VARCHAR(255) NOT NULL,
    allow_login BOOLEAN NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts.account (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status INT NOT NULL,
    last_login DATETIME,
    delete_code VARCHAR(255),
    account_status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_status_id) REFERENCES account_status(id)
);