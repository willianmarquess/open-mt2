CREATE DATABASE IF NOT EXISTS `accounts`;

CREATE TABLE IF NOT EXISTS accounts.account_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_status VARCHAR(20) NOT NULL,
    allow_login BOOLEAN NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts.account (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    last_login DATETIME NULL,
    delete_code VARCHAR(255) NOT NULL,
    account_status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_status_id) REFERENCES account_status(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player (
    id CHAR(36) PRIMARY KEY,
    account_id CHAR(36) NOT NULL,
    empire TINYINT UNSIGNED NOT NULL,
    player_class TINYINT UNSIGNED NOT NULL,
    skill_group TINYINT UNSIGNED NOT NULL,
    play_time INT UNSIGNED NOT NULL,
    level TINYINT UNSIGNED NOT NULL,
    experience INT UNSIGNED NOT NULL,
    gold INT UNSIGNED NOT NULL,
    st TINYINT UNSIGNED NOT NULL,
    ht TINYINT UNSIGNED NOT NULL,
    dx TINYINT UNSIGNED NOT NULL,
    iq TINYINT UNSIGNED NOT NULL,
    position_x INT NOT NULL,
    position_y INT NOT NULL,
    health BIGINT NOT NULL,
    mana BIGINT NOT NULL,
    stamina BIGINT NOT NULL,
    body_part INT UNSIGNED NOT NULL,
    hair_part INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    name VARCHAR(24) NOT NULL,
    given_status_points INT UNSIGNED NOT NULL,
    available_status_points INT UNSIGNED NOT NULL
);
-- DELETE FROM account where id = 'e34fd5ab-fb3b-428e-935b-7db5bd08a3e5';

-- INSERT INTO `account_status` (`id`, `allow_login`, `client_status`, `description`)
-- VALUES (1, TRUE, 'OK', 'Default Status');

-- INSERT INTO `account` (`id`, `delete_code`, `email`, `last_login`, `password`, 
-- `account_status_id`, `username`)
-- VALUES ('e34fd5ab-fb3b-428e-935b-7db5bd08a3e5', '1234567', 'admin@test.com', NULL, 
-- '$2y$10$5e9nP50E64iy8vaSMwrRWO7vCfnA7.p5XpIDHC3hPdi6BCtTF7rBS', 1, 'admin');