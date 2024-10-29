DROP DATABASE IF EXISTS `auth`;

CREATE DATABASE `auth`;

DROP TABLE IF EXISTS auth.account_status;

CREATE TABLE auth.account_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clientStatus VARCHAR(20) NOT NULL,
    allowLogin BOOLEAN NOT NULL,
    description TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS auth.account;

CREATE TABLE auth.account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    lastLogin DATETIME NULL,
    deleteCode VARCHAR(255) NOT NULL,
    accountStatusId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accountStatusId) REFERENCES account_status(id) ON DELETE CASCADE
);

INSERT INTO auth.account_status (`allowLogin`, `clientStatus`, `description`)
VALUES (TRUE, 'OK', 'Default Status');

INSERT INTO auth.account (`deleteCode`, `email`, `lastLogin`, `password`, 
`accountStatusId`, `username`)
VALUES ('1234567', 'admin@test.com', NULL, 
'$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin');

INSERT INTO auth.account (`deleteCode`, `email`, `lastLogin`, `password`, 
`accountStatusId`, `username`)
VALUES ('1234567', 'admin1@test.com', NULL, 
'$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin1');

DROP DATABASE IF EXISTS `game`;

CREATE DATABASE `game`;

DROP TABLE IF EXISTS game.player;

CREATE TABLE game.player (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    accountId INT UNSIGNED NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    empire TINYINT UNSIGNED NOT NULL,
    playerClass TINYINT UNSIGNED NOT NULL,
    skillGroup TINYINT UNSIGNED NOT NULL,
    playTime INT UNSIGNED NOT NULL DEFAULT 0,
    level INT UNSIGNED NOT NULL DEFAULT 1,
    experience INT UNSIGNED NOT NULL DEFAULT 0,
    gold INT UNSIGNED NOT NULL DEFAULT 0,
    st INT UNSIGNED NOT NULL DEFAULT 0,
    ht INT UNSIGNED NOT NULL DEFAULT 0,
    dx INT UNSIGNED NOT NULL DEFAULT 0,
    iq INT UNSIGNED NOT NULL DEFAULT 0,
    positionX INT NOT NULL,
    positionY INT NOT NULL,
    health BIGINT NOT NULL,
    mana BIGINT NOT NULL,
    stamina BIGINT NOT NULL,
    bodyPart INT UNSIGNED NOT NULL DEFAULT 0,
    hairPart INT UNSIGNED NOT NULL DEFAULT 0,
    name VARCHAR(24) NOT NULL,
    givenStatusPoints INT UNSIGNED NOT NULL DEFAULT 0,
    availableStatusPoints INT UNSIGNED NOT NULL DEFAULT 0,
    slot TINYINT UNSIGNED NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS game.item;

CREATE TABLE game.item (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ownerId INT UNSIGNED NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    window TINYINT UNSIGNED NOT NULL,
    position TINYINT UNSIGNED NOT NULL,
    count TINYINT UNSIGNED NOT NULL,
    protoId INT UNSIGNED NOT NULL DEFAULT 0,
    socket0 INT UNSIGNED DEFAULT 0,
    socket1 INT UNSIGNED DEFAULT 0,
    socket2 INT UNSIGNED DEFAULT 0,
    attributeType0 INT UNSIGNED DEFAULT 0,
    attributeValue0 INT UNSIGNED DEFAULT 0,
    attributeType1 INT UNSIGNED DEFAULT 0,
    attributeValue1 INT UNSIGNED DEFAULT 0,
    attributeType2 INT UNSIGNED DEFAULT 0,
    attributeValue2 INT UNSIGNED DEFAULT 0,
    attributeType3 INT UNSIGNED DEFAULT 0,
    attributeValue3 INT UNSIGNED DEFAULT 0,
    attributeType4 INT UNSIGNED DEFAULT 0,
    attributeValue4 INT UNSIGNED DEFAULT 0,
    attributeType5 INT UNSIGNED DEFAULT 0,
    attributeValue5 INT UNSIGNED DEFAULT 0,
    attributeType6 INT UNSIGNED DEFAULT 0,
    attributeValue6 INT UNSIGNED DEFAULT 0,
    FOREIGN KEY (ownerId)
        REFERENCES game.player(id)
        ON DELETE CASCADE
);