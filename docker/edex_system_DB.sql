-- Edex MVP Database Schema
-- Итоговая версия с учётом принятых решений
-- Charset: utf8mb4 | Engine: InnoDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- База данных: `edex`
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `edex`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `edex`;

-- --------------------------------------------------------
-- 1. Specialities (специальности)
-- --------------------------------------------------------

CREATE TABLE `specialities` (
  `code`            VARCHAR(15)  NOT NULL,
  `name`            VARCHAR(150) NOT NULL,
  `reduction`       VARCHAR(30)  DEFAULT NULL,
  `months_of_study` SMALLINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Academic_periods (календарные учебные периоды)
-- Номер учебного семестра (1,2,3…) вычисляется:
-- (YEAR(start_date) - YEAR(group.enrollment_date)) * 2 + half
-- --------------------------------------------------------

CREATE TABLE `academic_periods` (
  `id`             INT           NOT NULL AUTO_INCREMENT,
  `academic_year`  VARCHAR(9)    NOT NULL COMMENT 'Например: 2025/2026',
  `half`           TINYINT       NOT NULL COMMENT '1 или 2',
  `start_date`     DATE          NOT NULL,
  `end_date`       DATE          NOT NULL,
  `is_current`     BOOLEAN       NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_year_half` (`academic_year`, `half`),
  CONSTRAINT `chk_half` CHECK (`half` IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Subjects (предметы)
-- --------------------------------------------------------

CREATE TABLE `subjects` (
  `id`   INT          NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50)  NOT NULL COMMENT 'ПМ.05, ОГСЭ.01 и т.п.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Users (преподаватели и кураторы)
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(60)  NOT NULL,
  `surname`    VARCHAR(60)  NOT NULL,
  `patronymic` VARCHAR(60)  DEFAULT NULL,
  `login`      VARCHAR(50)  NOT NULL,
  `password`   VARCHAR(255) NOT NULL COMMENT 'Хеш пароля',
  `photo`           VARCHAR(255) DEFAULT NULL COMMENT 'Путь к файлу',
  `email`      VARCHAR(100) DEFAULT NULL,
  `phone`      VARCHAR(20)  DEFAULT NULL,
  `role`       ENUM('teacher', 'curator') NOT NULL,
  `position`   VARCHAR(100) DEFAULT NULL COMMENT 'Должность',
  `birth_date` DATE         DEFAULT NULL,
  `hire_date`  DATE         DEFAULT NULL COMMENT 'Для расчёта стажа',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Groups (учебные группы)
-- PK = id_shifr (шифр не меняется по правилам предметной области)
-- quantity НЕ хранится — считается через COUNT(students)
-- --------------------------------------------------------

CREATE TABLE `groups` (
  `id_shifr`        VARCHAR(15) NOT NULL COMMENT '23ИСП-1',
  `enrollment_date` DATE        NOT NULL COMMENT 'Для расчёта учебного семестра',
  `shifr_spec`      VARCHAR(15) NOT NULL,
  `id_curator`      INT         DEFAULT NULL,
  PRIMARY KEY (`id_shifr`),
  KEY `idx_shifr_spec` (`shifr_spec`),
  KEY `idx_curator` (`id_curator`),
  CONSTRAINT `fk_groups_speciality`
    FOREIGN KEY (`shifr_spec`) REFERENCES `specialities` (`code`),
  CONSTRAINT `fk_groups_curator`
    FOREIGN KEY (`id_curator`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Students (студенты)
-- --------------------------------------------------------

CREATE TABLE `students` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(60)  NOT NULL,
  `surname`         VARCHAR(60)  NOT NULL,
  `patronymic`      VARCHAR(60)  DEFAULT NULL,
  `group_id`        VARCHAR(15)  DEFAULT NULL,
  `photo`           VARCHAR(255) DEFAULT NULL COMMENT 'Путь к файлу',
  `birth_date`      DATE         DEFAULT NULL,
  `enrollment_date` DATE         NOT NULL,
  `status`          VARCHAR(30)  NOT NULL DEFAULT 'Обучается',
  PRIMARY KEY (`id`),
  KEY `idx_group` (`group_id`),
  CONSTRAINT `fk_students_group`
    FOREIGN KEY (`group_id`) REFERENCES `groups` (`id_shifr`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Teacher_assignments (назначения преподавателей)
-- Какой преподаватель ведёт какой предмет в какой группе
-- --------------------------------------------------------

CREATE TABLE `teacher_assignments` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `teacher_id` INT         NOT NULL,
  `subject_id` INT         NOT NULL,
  `group_id`   VARCHAR(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_teacher_subject_group` (`teacher_id`, `subject_id`, `group_id`),
  KEY `idx_ta_subject` (`subject_id`),
  KEY `idx_ta_group` (`group_id`),
  CONSTRAINT `fk_ta_teacher`
    FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ta_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ta_group`
    FOREIGN KEY (`group_id`) REFERENCES `groups` (`id_shifr`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Grades (оценки)
-- --------------------------------------------------------

CREATE TABLE `grades` (
  `id`              INT       NOT NULL AUTO_INCREMENT,
  `student_id`      INT       NOT NULL,
  `subject_id`      INT       NOT NULL,
  `teacher_id`      INT       NOT NULL,
  `period_id`       INT       NOT NULL,
  `grade`           TINYINT   NOT NULL,
  `assessment_date` DATE      NOT NULL COMMENT 'Дата, за которую выставлена оценка',
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Когда запись создана',
  PRIMARY KEY (`id`),
  KEY `idx_grades_student_period` (`student_id`, `period_id`),
  KEY `idx_grades_subject` (`subject_id`),
  KEY `idx_grades_teacher` (`teacher_id`),
  KEY `idx_grades_period` (`period_id`),
  CONSTRAINT `chk_grade` CHECK (`grade` BETWEEN 2 AND 5),
  CONSTRAINT `fk_grades_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_grades_teacher`
    FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_grades_period`
    FOREIGN KEY (`period_id`) REFERENCES `academic_periods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Attendance (посещаемость)
-- --------------------------------------------------------

CREATE TABLE `attendance` (
  `id`              INT              NOT NULL AUTO_INCREMENT,
  `student_id`      INT              NOT NULL,
  `subject_id`      INT              NOT NULL,
  `teacher_id`      INT              NOT NULL,
  `period_id`       INT              NOT NULL,
  `hours`           SMALLINT UNSIGNED NOT NULL COMMENT 'Пропущенные часы за занятие',
  `attendance_date` DATE             NOT NULL,
  `note`            TEXT             DEFAULT NULL,
  `created_at`      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_att_student_period` (`student_id`, `period_id`),
  KEY `idx_att_subject` (`subject_id`),
  KEY `idx_att_teacher` (`teacher_id`),
  KEY `idx_att_period` (`period_id`),
  CONSTRAINT `fk_att_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_att_teacher`
    FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_att_period`
    FOREIGN KEY (`period_id`) REFERENCES `academic_periods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Risks (риски — кэш расчёта)
-- Пересчитывается бэкендом после изменения оценок/посещаемости
-- --------------------------------------------------------

CREATE TABLE `risks` (
  `id`             INT            NOT NULL AUTO_INCREMENT,
  `student_id`     INT            NOT NULL,
  `period_id`      INT            NOT NULL,
  `risk_level`     ENUM('none','low','medium','high','critical') NOT NULL,
  `risk_score`     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `average_grade`  DECIMAL(3,2)   DEFAULT NULL COMMENT 'Денормализация',
  `missed_hours`   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `fails_count`    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `calculated_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_period` (`student_id`, `period_id`),
  KEY `idx_risk_level` (`risk_level`),
  KEY `idx_risk_period` (`period_id`),
  CONSTRAINT `fk_risks_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_risks_period`
    FOREIGN KEY (`period_id`) REFERENCES `academic_periods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Risk_reasons (причины риска)
-- --------------------------------------------------------

CREATE TABLE `risk_reasons` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `risk_id`     INT            NOT NULL,
  `reason_type` ENUM('attendance','avg_grade','fails_count') NOT NULL,
  `points`      SMALLINT UNSIGNED NOT NULL,
  `description` VARCHAR(255)   DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rr_risk` (`risk_id`),
  CONSTRAINT `fk_rr_risk`
    FOREIGN KEY (`risk_id`) REFERENCES `risks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
