-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.20.0.7320
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for webujian
CREATE DATABASE IF NOT EXISTS `webujian` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `webujian`;

-- Dumping structure for table webujian.cache
DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.cache: ~0 rows (approximately)

-- Dumping structure for table webujian.cache_locks
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.cache_locks: ~0 rows (approximately)

-- Dumping structure for table webujian.cheat_logs
DROP TABLE IF EXISTS `cheat_logs`;
CREATE TABLE IF NOT EXISTS `cheat_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `attemptId` char(36) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cheat_logs_attemptid_foreign` (`attemptId`),
  CONSTRAINT `cheat_logs_attemptid_foreign` FOREIGN KEY (`attemptId`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.cheat_logs: ~2 rows (approximately)
INSERT IGNORE INTO `cheat_logs` (`id`, `attemptId`, `description`, `created_at`, `updated_at`) VALUES
	(1, '019f75d8-fe89-7316-830f-b4be8a36c7f9', 'Keluar dari Mode Fullscreen', '2026-07-18 08:29:50', '2026-07-18 08:29:50'),
	(2, '019f75d8-fe89-7316-830f-b4be8a36c7f9', 'Keluar dari Mode Fullscreen', '2026-07-18 08:29:57', '2026-07-18 08:29:57'),
	(3, '019f75d8-fe89-7316-830f-b4be8a36c7f9', 'Keluar dari Mode Fullscreen', '2026-07-18 08:30:01', '2026-07-18 08:30:01');

-- Dumping structure for table webujian.exam_answers
DROP TABLE IF EXISTS `exam_answers`;
CREATE TABLE IF NOT EXISTS `exam_answers` (
  `id` char(36) NOT NULL,
  `attemptId` char(36) NOT NULL,
  `questionId` char(36) NOT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `isDoubtful` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_answers_attemptid_foreign` (`attemptId`),
  KEY `exam_answers_questionid_foreign` (`questionId`),
  CONSTRAINT `exam_answers_attemptid_foreign` FOREIGN KEY (`attemptId`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_answers_questionid_foreign` FOREIGN KEY (`questionId`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.exam_answers: ~4 rows (approximately)
INSERT IGNORE INTO `exam_answers` (`id`, `attemptId`, `questionId`, `answer`, `isDoubtful`, `created_at`, `updated_at`) VALUES
	('019f75c7-9fbe-731f-8632-f91f7509819b', '019f75c7-3eb7-721a-85db-e8715025bb27', '019f75c4-b075-704b-a4b6-a4a4a19b8083', 'D', 0, '2026-07-18 08:10:44', '2026-07-18 08:10:44'),
	('019f75c7-a651-7245-a6ee-857f9fc031e7', '019f75c7-3eb7-721a-85db-e8715025bb27', '019f75c4-ed3e-7384-834b-64f176d338a6', 'D', 0, '2026-07-18 08:10:46', '2026-07-18 08:10:46'),
	('019f75d9-08fb-738e-95c6-816e77118702', '019f75d8-fe89-7316-830f-b4be8a36c7f9', '019f75d6-b49e-70b7-8c20-ee562ffae5c2', 'D', 0, '2026-07-18 08:29:45', '2026-07-18 08:29:45'),
	('019f75d9-109e-718a-8d5d-d3c1ef68078d', '019f75d8-fe89-7316-830f-b4be8a36c7f9', '019f75d6-d1d0-728f-9edc-07515fbe84d6', 'C', 0, '2026-07-18 08:29:47', '2026-07-18 08:29:47');

-- Dumping structure for table webujian.exam_attempts
DROP TABLE IF EXISTS `exam_attempts`;
CREATE TABLE IF NOT EXISTS `exam_attempts` (
  `id` char(36) NOT NULL,
  `examId` char(36) NOT NULL,
  `userId` bigint(20) unsigned NOT NULL,
  `startTime` datetime NOT NULL,
  `finishedAt` datetime DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_attempts_examid_foreign` (`examId`),
  KEY `exam_attempts_userid_foreign` (`userId`),
  CONSTRAINT `exam_attempts_examid_foreign` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_attempts_userid_foreign` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.exam_attempts: ~2 rows (approximately)
INSERT IGNORE INTO `exam_attempts` (`id`, `examId`, `userId`, `startTime`, `finishedAt`, `score`, `created_at`, `updated_at`) VALUES
	('019f75c7-3eb7-721a-85db-e8715025bb27', '019f75c3-edbb-7328-b6fa-681a15488173', 2, '2026-07-18 15:10:19', '2026-07-18 15:11:56', 0, '2026-07-18 08:10:19', '2026-07-18 08:11:56'),
	('019f75d8-fe89-7316-830f-b4be8a36c7f9', '019f75d6-9429-7156-8ca3-3c5a715a2be0', 2, '2026-07-18 15:29:43', '2026-07-18 15:30:03', 0, '2026-07-18 08:29:43', '2026-07-18 08:30:03');

-- Dumping structure for table webujian.exam_comments
DROP TABLE IF EXISTS `exam_comments`;
CREATE TABLE IF NOT EXISTS `exam_comments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `attempt_id` char(36) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_comments_attempt_id_foreign` (`attempt_id`),
  KEY `exam_comments_user_id_foreign` (`user_id`),
  CONSTRAINT `exam_comments_attempt_id_foreign` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.exam_comments: ~0 rows (approximately)

-- Dumping structure for table webujian.exams
DROP TABLE IF EXISTS `exams`;
CREATE TABLE IF NOT EXISTS `exams` (
  `id` char(36) NOT NULL,
  `teacher_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `durationMin` int(11) NOT NULL,
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `isLive` tinyint(1) NOT NULL DEFAULT 0,
  `passingScore` int(11) NOT NULL DEFAULT 70,
  `allowRemedial` tinyint(1) NOT NULL DEFAULT 0,
  `exam_token` varchar(10) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `totalQuestions` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exams_teacher_id_foreign` (`teacher_id`),
  CONSTRAINT `exams_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.exams: ~3 rows (approximately)
INSERT IGNORE INTO `exams` (`id`, `teacher_id`, `title`, `subject`, `durationMin`, `startTime`, `endTime`, `isLive`, `passingScore`, `allowRemedial`, `exam_token`, `token_expires_at`, `totalQuestions`, `created_at`, `updated_at`) VALUES
	('019f7468-b2f0-71c1-a75c-c576bb1cabe8', NULL, 'awdwad', 'awdad', 60, NULL, NULL, 1, 70, 0, 'JPAY6L', '2026-07-18 10:47:34', 0, '2026-07-18 01:47:26', '2026-07-18 07:53:16'),
	('019f75c3-edbb-7328-b6fa-681a15488173', 3, 'memek', 'memek', 60, NULL, NULL, 0, 70, 0, '95CD4Y', '2026-07-18 17:06:57', 2, '2026-07-18 08:06:42', '2026-07-18 08:26:58'),
	('019f75d6-9429-7156-8ca3-3c5a715a2be0', 3, 'wdawdwadokawd', 'wadawdawdawdawda', 60, NULL, NULL, 1, 70, 0, 'L17DAB', '2026-07-18 17:29:08', 2, '2026-07-18 08:27:04', '2026-07-18 08:29:08');

-- Dumping structure for table webujian.failed_jobs
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table webujian.job_batches
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.job_batches: ~0 rows (approximately)

-- Dumping structure for table webujian.jobs
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.jobs: ~0 rows (approximately)

-- Dumping structure for table webujian.migrations
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.migrations: ~23 rows (approximately)
INSERT IGNORE INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_07_17_070751_create_exams_table', 1),
	(5, '2026_07_17_070751_create_questions_table', 1),
	(6, '2026_07_17_070752_create_exam_attempts_table', 1),
	(7, '2026_07_17_070753_create_exam_answers_table', 1),
	(8, '2026_07_17_081146_create_personal_access_tokens_table', 2),
	(9, '2026_07_17_092322_add_tgl_lahir_to_users_table', 3),
	(10, '2026_07_18_070651_update_siswa_is_approved_default', 4),
	(11, '2026_07_18_082055_add_avatar_and_subject_to_users_table', 5),
	(12, '2026_07_18_082625_create_cheat_logs_table', 6),
	(13, '2026_07_18_083740_add_remedial_columns_to_exams_table', 7),
	(14, '2026_07_18_084141_add_token_to_exams_table', 8),
	(15, '2026_07_18_084231_create_token_attempts_table', 8),
	(16, '2026_07_18_085931_create_question_banks_table', 9),
	(17, '2026_07_18_090004_add_question_bank_id_to_questions_table', 9),
	(18, '2026_07_18_091559_add_identity_columns_to_users', 10),
	(19, '2026_07_18_091607_add_teacher_id_to_exams', 11),
	(20, '2026_07_18_093629_create_exam_comments_table', 12),
	(21, '2026_07_18_094514_create_tickets_table', 13),
	(22, '2026_07_18_094520_create_ticket_replies_table', 13),
	(23, '2026_07_18_100234_add_last_seen_at_to_users_table', 14);

-- Dumping structure for table webujian.password_reset_tokens
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table webujian.personal_access_tokens
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.personal_access_tokens: ~58 rows (approximately)
INSERT IGNORE INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\User', 1, 'auth_token', 'a748ff486879f621031b8396e2837efcdadeed5908ce247cbc14c467a634cd3b', '["*"]', '2026-07-17 01:13:02', NULL, '2026-07-17 01:12:53', '2026-07-17 01:13:02'),
	(2, 'App\\Models\\User', 1, 'auth_token', '52d6cf9fbc760480bf1efaed5d37091f88ac25b8589c7aa5589869130b6cf7ea', '["*"]', '2026-07-17 02:00:56', NULL, '2026-07-17 02:00:29', '2026-07-17 02:00:56'),
	(3, 'App\\Models\\User', 1, 'auth_token', '6a76d833cbf423351f7f143388fc7cc029563ca09e39b173eb241e6d9b4350bd', '["*"]', '2026-07-17 02:09:04', NULL, '2026-07-17 02:01:01', '2026-07-17 02:09:04'),
	(4, 'App\\Models\\User', 1, 'auth_token', '549846de5a1e1082af972e8140b3b9c8f0eb1978da049f3c644f9df57eb3f715', '["*"]', '2026-07-17 02:10:28', NULL, '2026-07-17 02:09:08', '2026-07-17 02:10:28'),
	(5, 'App\\Models\\User', 1, 'auth_token', '973471cb686d4f7a8e70b0ea071963cd43fb4dea9d924e3084a3696728357c5f', '["*"]', '2026-07-17 02:10:35', NULL, '2026-07-17 02:10:34', '2026-07-17 02:10:35'),
	(6, 'App\\Models\\User', 1, 'auth_token', 'e35547fe6716110812d87a0a23394db80fa9f57c07924e15a9ccd7bab0a0edbd', '["*"]', '2026-07-17 02:13:12', NULL, '2026-07-17 02:13:06', '2026-07-17 02:13:12'),
	(7, 'App\\Models\\User', 1, 'auth_token', 'b921063ac475517be88395533f04c4041b5204ed645e53eb8090a4cbb19e0699', '["*"]', '2026-07-17 02:19:09', NULL, '2026-07-17 02:14:34', '2026-07-17 02:19:09'),
	(8, 'App\\Models\\User', 2, 'auth_token', '855551a78f4b7338e3438c87eaf8317369158772929902e881bae9dbfeff11a8', '["*"]', '2026-07-17 02:25:53', NULL, '2026-07-17 02:19:18', '2026-07-17 02:25:53'),
	(9, 'App\\Models\\User', 2, 'auth_token', 'cecfff446dfb0c2542ea86c7a556b4144dffe2d11c8e9104acf35854a0aafc9b', '["*"]', '2026-07-17 02:34:27', NULL, '2026-07-17 02:34:10', '2026-07-17 02:34:27'),
	(10, 'App\\Models\\User', 2, 'auth_token', '23c3a29cedb341867b42a431d3c9053c9fc2f8914e1e4cb88464c7c91be5b643', '["*"]', '2026-07-17 02:43:40', NULL, '2026-07-17 02:39:08', '2026-07-17 02:43:40'),
	(11, 'App\\Models\\User', 1, 'auth_token', '0c5da12c6f162a41b6c95eb59c06d782565e788ffb1c552e7163cdac69ae4e02', '["*"]', '2026-07-17 02:45:15', NULL, '2026-07-17 02:44:16', '2026-07-17 02:45:15'),
	(12, 'App\\Models\\User', 3, 'auth_token', 'a645f9a72f05bb3b88c3ac4cad5d16c8023f8e0380025e2a28964d76b98c82ef', '["*"]', '2026-07-17 02:45:36', NULL, '2026-07-17 02:45:26', '2026-07-17 02:45:36'),
	(13, 'App\\Models\\User', 1, 'auth_token', '310fb1c1b0fa383415e2ce7eb13a4c9415e43539726bb5421bf42db15e20d07e', '["*"]', '2026-07-17 02:50:30', NULL, '2026-07-17 02:47:52', '2026-07-17 02:50:30'),
	(14, 'App\\Models\\User', 3, 'auth_token', '91a7581605eac1651f053f749c4e9486fd99cc20223efe1ed480c6732434c071', '["*"]', '2026-07-17 02:53:41', NULL, '2026-07-17 02:50:39', '2026-07-17 02:53:41'),
	(15, 'App\\Models\\User', 1, 'auth_token', '1c44e687e5b1146e5fe78c3706ec2dbe801acd71ccc6998975023a6d18c351cf', '["*"]', '2026-07-17 03:01:12', NULL, '2026-07-17 02:53:54', '2026-07-17 03:01:12'),
	(16, 'App\\Models\\User', 3, 'auth_token', '8b4dcbe6b5f700612fbdd3175064f90f5b62f892d38baae4e34b2f5924ea1811', '["*"]', '2026-07-17 03:01:35', NULL, '2026-07-17 03:01:26', '2026-07-17 03:01:35'),
	(17, 'App\\Models\\User', 1, 'auth_token', 'e3f8feab47439c885d7acb83ef3f49a68e0519b0e95819185cbac1c2af45bf2e', '["*"]', '2026-07-17 03:14:43', NULL, '2026-07-17 03:01:47', '2026-07-17 03:14:43'),
	(18, 'App\\Models\\User', 3, 'auth_token', 'e9b294d8010a9da8c9eb88e979e724eb2d06a87ff80319a6aa27c810e5e6fbc5', '["*"]', '2026-07-17 03:17:00', NULL, '2026-07-17 03:15:01', '2026-07-17 03:17:00'),
	(19, 'App\\Models\\User', 1, 'auth_token', '82de47ce28ee1c22e5750d381b7cc80a5d6ed95dc54700da1c55a8debe7381ab', '["*"]', '2026-07-17 03:17:42', NULL, '2026-07-17 03:17:38', '2026-07-17 03:17:42'),
	(20, 'App\\Models\\User', 2, 'auth_token', 'ad691479a781c1db8192b362b92e7943d6a4682f01c9d87c5f4d4b981640b0c3', '["*"]', '2026-07-18 00:07:59', NULL, '2026-07-17 03:18:31', '2026-07-18 00:07:59'),
	(21, 'App\\Models\\User', 1, 'auth_token', '145e561a0c560c5c04f9c0d9af8b39b8cbb0e8787efdb27ab7f418239ed2d536', '["*"]', '2026-07-18 00:28:35', NULL, '2026-07-18 00:12:25', '2026-07-18 00:28:35'),
	(22, 'App\\Models\\User', 4, 'auth_token', '3404af24e2f53432b9620dc30a058538fd00281eb0a56a61b4c6c9621fa8805a', '["*"]', '2026-07-18 00:29:20', NULL, '2026-07-18 00:29:01', '2026-07-18 00:29:20'),
	(23, 'App\\Models\\User', 5, 'auth_token', 'fb54c096cfeba4c4527a002aea6dda9236ec14bae6c0ced3f761f8602ba0e737', '["*"]', '2026-07-18 00:38:44', NULL, '2026-07-18 00:38:36', '2026-07-18 00:38:44'),
	(24, 'App\\Models\\User', 1, 'auth_token', '7305dea045f44447033f6212acdfa1f814b9c1c7395142b8cd05061f0518a7b1', '["*"]', '2026-07-18 00:40:44', NULL, '2026-07-18 00:40:17', '2026-07-18 00:40:44'),
	(25, 'App\\Models\\User', 2, 'auth_token', '971b7cecff6bc688de2d6e424dab45e8a9b7cac54c6a8ed15ac8ac70b67f1f0c', '["*"]', '2026-07-18 00:52:55', NULL, '2026-07-18 00:52:50', '2026-07-18 00:52:55'),
	(26, 'App\\Models\\User', 1, 'auth_token', '0718c098a8b214bd1d3aa48d54658b6fb2ec5ab991e13e959c55b81a0e9664af', '["*"]', '2026-07-18 01:11:44', NULL, '2026-07-18 01:11:25', '2026-07-18 01:11:44'),
	(27, 'App\\Models\\User', 3, 'auth_token', '3512c94c7e66f6815f4d68300bae632315197a70ebb43c87d6cd7fbe2e3f43a5', '["*"]', '2026-07-18 01:18:37', NULL, '2026-07-18 01:12:02', '2026-07-18 01:18:37'),
	(28, 'App\\Models\\User', 2, 'auth_token', '296c324ce804a55288269d928b279385daae82ac9be53c9b6057e59862b11d24', '["*"]', '2026-07-18 01:25:32', NULL, '2026-07-18 01:24:02', '2026-07-18 01:25:32'),
	(29, 'App\\Models\\User', 3, 'auth_token', 'db65db6afa8aa84426436378964fc4a64cfcca448ee70d34284defbad543c0ae', '["*"]', '2026-07-18 01:30:40', NULL, '2026-07-18 01:30:35', '2026-07-18 01:30:40'),
	(30, 'App\\Models\\User', 2, 'auth_token', 'e848a25d071d09852d8d50c1a235417ab4efc661bdf7ab3c7da64a92b9ad200e', '["*"]', '2026-07-18 01:31:36', NULL, '2026-07-18 01:30:55', '2026-07-18 01:31:36'),
	(31, 'App\\Models\\User', 3, 'auth_token', 'a1cbb715ee754fdb3ccc53d402b9b1fcdf1a3e3f1e0fe20b4d2fb5d5c94dded1', '["*"]', '2026-07-18 01:32:23', NULL, '2026-07-18 01:31:57', '2026-07-18 01:32:23'),
	(32, 'App\\Models\\User', 2, 'auth_token', '94e187bdc9551a66ee5fbdb9f8a147890320af7f6ce8c0f29d109c2338c7ae84', '["*"]', '2026-07-18 01:46:54', NULL, '2026-07-18 01:32:37', '2026-07-18 01:46:54'),
	(33, 'App\\Models\\User', 3, 'auth_token', '4cf0e9c97f47884b97e75aa5f0b6fde4636ff5465816b0747fcc0aa419491266', '["*"]', '2026-07-18 01:47:34', NULL, '2026-07-18 01:47:07', '2026-07-18 01:47:34'),
	(34, 'App\\Models\\User', 2, 'auth_token', 'd6929341b9cf70b338e0015a8515942f426d269f1f1b4ac672c3b07cc674dd11', '["*"]', '2026-07-18 01:57:41', NULL, '2026-07-18 01:48:01', '2026-07-18 01:57:41'),
	(35, 'App\\Models\\User', 3, 'auth_token', '1c79f681ddcb50a5ac711ad751a38e60d109bcb2d7d07638f82d4791ea284545', '["*"]', '2026-07-18 01:58:27', NULL, '2026-07-18 01:57:56', '2026-07-18 01:58:27'),
	(36, 'App\\Models\\User', 1, 'auth_token', '6100f3b4aae1f3a1c6209995c6535c7c312fd79c766baf4dda5fed60f4961b36', '["*"]', '2026-07-18 02:04:15', NULL, '2026-07-18 01:58:36', '2026-07-18 02:04:15'),
	(37, 'App\\Models\\User', 2, 'auth_token', 'f5fd52e41969dec9716f1ee155c16212866b2adc8148d63ba948a1793659ed64', '["*"]', '2026-07-18 02:27:44', NULL, '2026-07-18 02:27:35', '2026-07-18 02:27:44'),
	(38, 'App\\Models\\User', 2, 'auth_token', '7b7153ccd471100b3db123f9ecdaf3db0acd846b16163f3377fdbc970f94f2d1', '["*"]', '2026-07-18 02:52:08', NULL, '2026-07-18 02:33:26', '2026-07-18 02:52:08'),
	(39, 'App\\Models\\User', 2, 'auth_token', 'd616a9a8f812763751477300ab2d377d2610af9e13ddf5114d1a23a493b48a32', '["*"]', '2026-07-18 02:52:43', NULL, '2026-07-18 02:52:24', '2026-07-18 02:52:43'),
	(40, 'App\\Models\\User', 1, 'auth_token', 'bf55ae8e544bc9dd9a5a1072635be0144e9e1d0f409b7f7ef076cac70f9654af', '["*"]', '2026-07-18 02:53:23', NULL, '2026-07-18 02:52:52', '2026-07-18 02:53:23'),
	(41, 'App\\Models\\User', 2, 'auth_token', '83becd71777626471f4513e4cf92edfc6d40075987ff0040cb4f0b451d80d33b', '["*"]', '2026-07-18 02:54:13', NULL, '2026-07-18 02:53:36', '2026-07-18 02:54:13'),
	(42, 'App\\Models\\User', 1, 'auth_token', 'ade5895ab4cbeaa941924c380a9d8cea7caebff49c26422c5561877af9c18533', '["*"]', '2026-07-18 02:59:19', NULL, '2026-07-18 02:54:54', '2026-07-18 02:59:19'),
	(43, 'App\\Models\\User', 6, 'auth_token', 'e8ea26e399dc6134c1839337fd234a1454da230fed04044bc26bfcb0a483ee25', '["*"]', '2026-07-18 03:05:43', NULL, '2026-07-18 02:59:40', '2026-07-18 03:05:43'),
	(44, 'App\\Models\\User', 2, 'auth_token', 'd54ca98dca7c475883926e71dabd85fbe39cc5e3614881ea11b42743f7d9cda9', '["*"]', '2026-07-18 07:24:22', NULL, '2026-07-18 03:05:57', '2026-07-18 07:24:22'),
	(45, 'App\\Models\\User', 7, 'auth_token', '8bc73ffba15bdf7bf39cb577afc5e5a50e7d96c9e26eda6dc4624ebfb491bcc6', '["*"]', '2026-07-18 07:27:14', NULL, '2026-07-18 07:24:36', '2026-07-18 07:27:14'),
	(46, 'App\\Models\\User', 8, 'auth_token', 'd965c126cc06554ede939d4f37049f7b68980d7d671007af03673a4371ea740e', '["*"]', '2026-07-18 07:30:47', NULL, '2026-07-18 07:29:42', '2026-07-18 07:30:47'),
	(47, 'App\\Models\\User', 1, 'auth_token', '138fd3ac5a9b9e8eaed6a0c2abc5daf11f5e3762df71651a00605090c69f351f', '["*"]', '2026-07-18 07:38:16', NULL, '2026-07-18 07:30:55', '2026-07-18 07:38:16'),
	(48, 'App\\Models\\User', 1, 'auth_token', 'ae83d10d888b7285fa890a0a09d5d28ddafa9b2e0cd45400436740ff6db26dec', '["*"]', '2026-07-18 08:00:49', NULL, '2026-07-18 07:34:48', '2026-07-18 08:00:49'),
	(49, 'App\\Models\\User', 3, 'auth_token', 'd26f1f26184bf66835fcdcb861b4a250bdb3160d121de55ffe6fe38b58293b57', '["*"]', '2026-07-18 08:08:27', NULL, '2026-07-18 08:01:04', '2026-07-18 08:08:27'),
	(50, 'App\\Models\\User', 2, 'auth_token', 'a22fb0c7f5335524e1f35435aa3080b9b77cd8866f170a17088228714607efd9', '["*"]', '2026-07-18 08:09:01', NULL, '2026-07-18 08:08:44', '2026-07-18 08:09:01'),
	(51, 'App\\Models\\User', 3, 'auth_token', 'a4b8c92fb8ecb2b32a7bf0161b3fa77b3de40ff6129a4b1dbb8f5aee1edf714a', '["*"]', '2026-07-18 08:09:36', NULL, '2026-07-18 08:09:29', '2026-07-18 08:09:36'),
	(52, 'App\\Models\\User', 2, 'auth_token', 'fed29750e0d6179bde6f481819722a7a3e64c8f419c4cc39f5589959e06d16cd', '["*"]', '2026-07-18 08:24:50', NULL, '2026-07-18 08:10:01', '2026-07-18 08:24:50'),
	(53, 'App\\Models\\User', 3, 'auth_token', '00b76ab824bbaae7ba6917994c99bbefdd2c4876cca6a0689e408b8a247b99b5', '["*"]', '2026-07-18 08:25:14', NULL, '2026-07-18 08:25:05', '2026-07-18 08:25:14'),
	(54, 'App\\Models\\User', 2, 'auth_token', '01d156556f5d81d4d4f57173c26c6ef84a77102ca90ed2e6355302df686b2c34', '["*"]', '2026-07-18 08:26:17', NULL, '2026-07-18 08:25:53', '2026-07-18 08:26:17'),
	(55, 'App\\Models\\User', 3, 'auth_token', 'f4dfdc3e74f79e081a892c17c0517c3ee29f1f4bab1ab74d8a892b18f0a8e0ce', '["*"]', '2026-07-18 08:27:36', NULL, '2026-07-18 08:26:45', '2026-07-18 08:27:36'),
	(56, 'App\\Models\\User', 2, 'auth_token', 'f259e3263477b21e8546d8c36f7f38e43646b8077d40cb1d39da111d1a841d32', '["*"]', '2026-07-18 08:28:33', NULL, '2026-07-18 08:28:06', '2026-07-18 08:28:33'),
	(57, 'App\\Models\\User', 3, 'auth_token', '21ffb0a9d93fc91c16772ef0386407f29d9eca0b1102c601a8ac821c08fbe90c', '["*"]', '2026-07-18 08:29:16', NULL, '2026-07-18 08:28:40', '2026-07-18 08:29:16'),
	(58, 'App\\Models\\User', 2, 'auth_token', '3c3876aa2a2ee2a5e91621fa94639ca73ba64c3c9c2c6966c5acaec39a7173ea', '["*"]', '2026-07-18 08:35:05', NULL, '2026-07-18 08:29:28', '2026-07-18 08:35:05');

-- Dumping structure for table webujian.question_banks
DROP TABLE IF EXISTS `question_banks`;
CREATE TABLE IF NOT EXISTS `question_banks` (
  `id` char(36) NOT NULL,
  `teacher_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_banks_teacher_id_foreign` (`teacher_id`),
  CONSTRAINT `question_banks_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.question_banks: ~0 rows (approximately)

-- Dumping structure for table webujian.questions
DROP TABLE IF EXISTS `questions`;
CREATE TABLE IF NOT EXISTS `questions` (
  `id` char(36) NOT NULL,
  `examId` char(36) DEFAULT NULL,
  `content` text NOT NULL,
  `optionA` varchar(255) NOT NULL,
  `optionB` varchar(255) NOT NULL,
  `optionC` varchar(255) NOT NULL,
  `optionD` varchar(255) NOT NULL,
  `optionE` varchar(255) DEFAULT NULL,
  `answer` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `question_bank_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `questions_examid_foreign` (`examId`),
  KEY `questions_question_bank_id_foreign` (`question_bank_id`),
  CONSTRAINT `questions_examid_foreign` FOREIGN KEY (`examId`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_question_bank_id_foreign` FOREIGN KEY (`question_bank_id`) REFERENCES `question_banks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.questions: ~4 rows (approximately)
INSERT IGNORE INTO `questions` (`id`, `examId`, `content`, `optionA`, `optionB`, `optionC`, `optionD`, `optionE`, `answer`, `imageUrl`, `created_at`, `updated_at`, `question_bank_id`) VALUES
	('019f75c4-b075-704b-a4b6-a4a4a19b8083', '019f75c3-edbb-7328-b6fa-681a15488173', 'memek', 'awdwada', 'wadawdwad', 'waawdwad', 'wdawd', 'awdawda', 'A', NULL, '2026-07-18 08:07:32', '2026-07-18 08:07:32', NULL),
	('019f75c4-ed3e-7384-834b-64f176d338a6', '019f75c3-edbb-7328-b6fa-681a15488173', 'wadawdwada', 'wdawd', 'dadwwda', 'wadawda', 'adwadwa', 'wdawdd', 'C', 'http://localhost:8000/storage/questions/XHsqXbTlnDS0sXGDcOIvICoWUFOfLrP7izrcbHMq.png', '2026-07-18 08:07:47', '2026-07-18 08:07:47', NULL),
	('019f75d6-b49e-70b7-8c20-ee562ffae5c2', '019f75d6-9429-7156-8ca3-3c5a715a2be0', 'addwadwa', 'dwad', 'dwadawd', 'wadaw', 'dadwa', 'wadwadawdaw', 'A', NULL, '2026-07-18 08:27:13', '2026-07-18 08:27:13', NULL),
	('019f75d6-d1d0-728f-9edc-07515fbe84d6', '019f75d6-9429-7156-8ca3-3c5a715a2be0', 'wadwadwa', 'dwadaw', 'dawdawdaw', 'dwad', 'wadwa', 'wadawdawd', 'A', NULL, '2026-07-18 08:27:20', '2026-07-18 08:27:20', NULL);

-- Dumping structure for table webujian.sessions
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.sessions: ~0 rows (approximately)

-- Dumping structure for table webujian.ticket_replies
DROP TABLE IF EXISTS `ticket_replies`;
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_replies_ticket_id_foreign` (`ticket_id`),
  KEY `ticket_replies_user_id_foreign` (`user_id`),
  CONSTRAINT `ticket_replies_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.ticket_replies: ~3 rows (approximately)
INSERT IGNORE INTO `ticket_replies` (`id`, `ticket_id`, `user_id`, `message`, `is_read`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, 'tsee', 1, '2026-07-18 02:52:38', '2026-07-18 02:52:38'),
	(2, 1, 1, 'oke', 1, '2026-07-18 02:53:02', '2026-07-18 02:53:51'),
	(3, 1, 6, 'oke', 1, '2026-07-18 02:59:53', '2026-07-18 07:31:44');

-- Dumping structure for table webujian.tickets
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('open','answered','closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tickets_user_id_foreign` (`user_id`),
  CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.tickets: ~0 rows (approximately)
INSERT IGNORE INTO `tickets` (`id`, `user_id`, `subject`, `status`, `created_at`, `updated_at`) VALUES
	(1, 2, 'test', 'answered', '2026-07-18 02:52:38', '2026-07-18 02:53:02');

-- Dumping structure for table webujian.token_attempts
DROP TABLE IF EXISTS `token_attempts`;
CREATE TABLE IF NOT EXISTS `token_attempts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` char(36) NOT NULL,
  `examId` char(36) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.token_attempts: ~3 rows (approximately)
INSERT IGNORE INTO `token_attempts` (`id`, `userId`, `examId`, `attempts`, `created_at`, `updated_at`) VALUES
	(1, '2', '019f75c3-edbb-7328-b6fa-681a15488173', 0, '2026-07-18 08:10:19', '2026-07-18 08:10:19'),
	(2, '2', '019f7468-b2f0-71c1-a75c-c576bb1cabe8', 2, '2026-07-18 08:26:07', '2026-07-18 08:28:19'),
	(3, '2', '019f75d6-9429-7156-8ca3-3c5a715a2be0', 0, '2026-07-18 08:29:42', '2026-07-18 08:29:42');

-- Dumping structure for table webujian.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `role` varchar(255) NOT NULL DEFAULT 'SISWA',
  `kelas` varchar(255) DEFAULT NULL,
  `jurusan` varchar(255) DEFAULT NULL,
  `tgl_lahir` date DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `nis` varchar(255) DEFAULT NULL,
  `nisn` varchar(255) DEFAULT NULL,
  `nuptk` varchar(255) DEFAULT NULL,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_nis_unique` (`nis`),
  UNIQUE KEY `users_nisn_unique` (`nisn`),
  UNIQUE KEY `users_nuptk_unique` (`nuptk`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table webujian.users: ~7 rows (approximately)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `google_id`, `is_approved`, `role`, `kelas`, `jurusan`, `tgl_lahir`, `remember_token`, `created_at`, `updated_at`, `avatar`, `subject`, `nis`, `nisn`, `nuptk`, `last_seen_at`) VALUES
	(1, 'Admin Utama', 'naxeone.id@gmail.com', NULL, '$2y$12$VwSkm6yeZU74dN0lr2d1Peygoa/bVEZndPZhGQOAU4ETQDbk1FZEG', NULL, 1, 'ADMIN', NULL, NULL, NULL, NULL, '2026-07-17 00:53:04', '2026-07-18 08:00:24', NULL, NULL, NULL, NULL, NULL, '2026-07-18 08:00:24'),
	(2, 'Miftah Khoiru Syahri', 'miftah.121230106@student.itera.ac.id', NULL, NULL, '102869633874931818729', 1, 'SISWA', 'XI', 'IPA', '2026-07-07', NULL, '2026-07-17 02:13:38', '2026-07-18 08:35:05', NULL, NULL, NULL, NULL, NULL, '2026-07-18 08:35:05'),
	(3, 'ruruwrr', 'vipernex1@gmail.com', NULL, NULL, '116036288468572423429', 1, 'GURU', NULL, NULL, '2026-07-01', NULL, '2026-07-17 02:45:26', '2026-07-18 08:28:46', NULL, NULL, NULL, NULL, NULL, '2026-07-18 08:28:46'),
	(4, 'ruruu uuu', 'ruruuprime@gmail.com', NULL, NULL, '100338725260903369593', 1, 'SISWA', 'X', 'TKJ', '2026-06-30', NULL, '2026-07-18 00:29:01', '2026-07-18 00:29:14', NULL, NULL, NULL, NULL, NULL, NULL),
	(5, 'Miftah Khoiru Syahri', 'miftahkhoiru.sy@gmail.com', NULL, NULL, '105198299545564172118', 1, 'GURU', NULL, NULL, '2026-07-30', NULL, '2026-07-18 00:38:36', '2026-07-18 00:40:25', NULL, NULL, NULL, NULL, NULL, NULL),
	(6, 'Admin', 'admin@gmail.com', NULL, '$2y$12$3LnzxKccQR4e5WC0DHD0yOI6MoYIA5BX0RnOgFUrHjkmYuGp8a00O', NULL, 1, 'ADMIN', NULL, NULL, NULL, NULL, '2026-07-18 02:54:45', '2026-07-18 03:05:38', NULL, NULL, NULL, NULL, NULL, '2026-07-18 03:05:38'),
	(8, 'Ruruweerr', 'anjay@gmail.com', NULL, '$2y$12$yA1v8w3NvY2Ye7yMJRdm8OEG3Qh5i9V.M0U.yqja9awDQiu8Fostq', NULL, 1, 'SISWA', 'X IPA C', 'IPA', '2026-07-07', NULL, '2026-07-18 07:29:42', '2026-07-18 07:30:41', NULL, NULL, NULL, NULL, NULL, '2026-07-18 07:30:41');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
