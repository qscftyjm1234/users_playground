CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `AuditLogs` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `EntityName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `EntityId` int NOT NULL,
    `Action` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Changes` longtext CHARACTER SET utf8mb4 NOT NULL,
    `PerformedBy` longtext CHARACTER SET utf8mb4 NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_AuditLogs` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Groups` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `InviteCode` longtext CHARACTER SET utf8mb4 NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Groups` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `LoginAccount` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Username` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(255) CHARACTER SET utf8mb4 NULL,
    `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AvatarUrl` longtext CHARACTER SET utf8mb4 NULL,
    `Role` int NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Events` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `GroupId` int NOT NULL,
    `Title` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `Date` datetime(6) NOT NULL,
    `Location` longtext CHARACTER SET utf8mb4 NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Events` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Events_Groups_GroupId` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Memos` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `GroupId` int NOT NULL,
    `Content` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Tags` longtext CHARACTER SET utf8mb4 NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Memos` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Memos_Groups_GroupId` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Expenses` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `GroupId` int NOT NULL,
    `PaidByUserId` int NOT NULL,
    `Amount` decimal(18,2) NOT NULL,
    `Category` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Date` datetime(6) NOT NULL,
    `Notes` longtext CHARACTER SET utf8mb4 NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Expenses` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Expenses_Groups_GroupId` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Expenses_Users_PaidByUserId` FOREIGN KEY (`PaidByUserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Tasks` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `GroupId` int NOT NULL,
    `Title` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `AssignedToUserId` int NULL,
    `DueDate` datetime(6) NULL,
    `Status` int NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_Tasks` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Tasks_Groups_GroupId` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Tasks_Users_AssignedToUserId` FOREIGN KEY (`AssignedToUserId`) REFERENCES `Users` (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `UserGroups` (
    `UserId` int NOT NULL,
    `GroupId` int NOT NULL,
    `Role` int NOT NULL,
    `JoinedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_UserGroups` PRIMARY KEY (`UserId`, `GroupId`),
    CONSTRAINT `FK_UserGroups_Groups_GroupId` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_UserGroups_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `ExpenseShares` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `ExpenseId` int NOT NULL,
    `UserId` int NOT NULL,
    `OwedAmount` decimal(18,2) NOT NULL,
    `IsDeleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NULL,
    CONSTRAINT `PK_ExpenseShares` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_ExpenseShares_Expenses_ExpenseId` FOREIGN KEY (`ExpenseId`) REFERENCES `Expenses` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_ExpenseShares_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_Events_GroupId` ON `Events` (`GroupId`);

CREATE INDEX `IX_Expenses_GroupId` ON `Expenses` (`GroupId`);

CREATE INDEX `IX_Expenses_PaidByUserId` ON `Expenses` (`PaidByUserId`);

CREATE INDEX `IX_ExpenseShares_ExpenseId` ON `ExpenseShares` (`ExpenseId`);

CREATE INDEX `IX_ExpenseShares_UserId` ON `ExpenseShares` (`UserId`);

CREATE INDEX `IX_Memos_GroupId` ON `Memos` (`GroupId`);

CREATE INDEX `IX_Tasks_AssignedToUserId` ON `Tasks` (`AssignedToUserId`);

CREATE INDEX `IX_Tasks_GroupId` ON `Tasks` (`GroupId`);

CREATE INDEX `IX_UserGroups_GroupId` ON `UserGroups` (`GroupId`);

CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);

CREATE UNIQUE INDEX `IX_Users_LoginAccount` ON `Users` (`LoginAccount`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260327095716_InitialCreate', '7.0.14');

COMMIT;

