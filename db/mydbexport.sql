
CREATE DATABASE IF NOT EXISTS  mydb;

USE mydb;

SHOW DATABASES;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `Persons`;

CREATE TABLE `Persons` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `Persons` WRITE;

INSERT INTO `Persons` (`id`, `name`)
VALUES
	(1,'john'),
	(2,'jack');

UNLOCK TABLES;


DROP TABLE IF EXISTS `Orders`;

CREATE TABLE `Orders` (
  `id` int NOT NULL,
  `OrderNumber` int NOT NULL,
  `PersonId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `PersonId` (`PersonId`),
  CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`PersonId`) REFERENCES `Persons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `Orders` WRITE;


INSERT INTO `Orders` (`id`, `OrderNumber`, `PersonId`)
VALUES
	(1,100,1),
	(2,101,2);

UNLOCK TABLES;




