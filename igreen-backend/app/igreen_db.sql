/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : igreen_db

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 08/02/2026 19:23:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for files
-- ----------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `field_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of files
-- ----------------------------
BEGIN;
INSERT INTO `files` (`id`, `created_at`, `field_type`, `name`, `size`, `type`, `url`) VALUES ('e9a927ae-b3e9-406a-aeb8-eabe34c2088b', '2026-01-31 20:35:25', 'beforePhoto', '微信图片_20250828162928_178.jpg', 138420, 'image/jpeg', '/uploads/e9a927ae-b3e9-406a-aeb8-eabe34c2088b.jpg');
COMMIT;

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_group_name` (`name`),
  KEY `idx_group_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of groups
-- ----------------------------
BEGIN;
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('4aec8a22-62e3-466c-b147-33f79402f060', '分组1', '测试分组 1', NULL, 'ACTIVE', '2026-01-20 20:37:06', '2026-01-20 20:37:06');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('98fcedb6-fa1e-4db3-8270-706cf5046651', '分组4', '测试分组 4', NULL, 'ACTIVE', '2026-01-20 20:37:06', '2026-01-20 20:37:06');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('d5e1cc92-429e-4dac-aba7-f3e780eace4d', '分组2', '测试分组 2', NULL, 'ACTIVE', '2026-01-20 20:37:06', '2026-01-20 20:37:06');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('ff11bb8d-795f-433a-a6f3-161dada632ce', '分组3', '测试分组 3', NULL, 'ACTIVE', '2026-01-20 20:37:06', '2026-01-20 20:37:06');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('group-001', '华东区', '华东地区服务团队', NULL, 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('group-002', '华南区', '华南地区服务团队', NULL, 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('group-003', '华北区', '华北地区服务团队', NULL, 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `groups` (`id`, `name`, `description`, `tags`, `status`, `created_at`, `updated_at`) VALUES ('group-004', '西南区', '西南地区服务团队', NULL, 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
COMMIT;

-- ----------------------------
-- Table structure for problem_types
-- ----------------------------
DROP TABLE IF EXISTS `problem_types`;
CREATE TABLE `problem_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of problem_types
-- ----------------------------
BEGIN;
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('d5134222-88f2-40a7-8609-e9c8ff9e9020', '111', '111', NULL, NULL);
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-001', '设备故障', '充电设备无法正常工作', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-002', '网络异常', '网络连接问题导致无法通信', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-003', '支付问题2', '支付失败或退款问题2', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-004', '充电速度慢', '充电效率低于预期', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-005', '显示屏故障', '显示屏不亮或显示异常', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-006', '枪头损坏', '充电枪头物理损坏', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-007', '二维码无法识别', '设备二维码扫描失败', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `problem_types` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('pt-008', '其他', '其他问题类型', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
COMMIT;

-- ----------------------------
-- Table structure for site_level_configs
-- ----------------------------
DROP TABLE IF EXISTS `site_level_configs`;
CREATE TABLE `site_level_configs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sla_multiplier` decimal(5,2) DEFAULT NULL,
  `max_concurrent_tickets` int DEFAULT '5',
  `escalation_time_hours` int DEFAULT '4',
  `created_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of site_level_configs
-- ----------------------------
BEGIN;
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('d5622a4f-4673-4015-bfc1-426e588d7e9e', '测试站点', '测试站点', NULL, 5, 4, NULL, NULL);
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-001', '大型站点', NULL, NULL, 10, 2, '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-002', '中型站点', NULL, NULL, 5, 4, '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-003', '小型站点', NULL, NULL, 2, 8, '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-test-001', 'VIP 站点', 'VIP 级别站点配置，高优先级服务', NULL, 10, 2, '2026-01-21 02:17:44', '2026-01-21 02:17:44');
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-test-002', 'Enterprise 站点', '企业级站点配置', NULL, 8, 3, '2026-01-21 02:17:44', '2026-01-21 02:17:44');
INSERT INTO `site_level_configs` (`id`, `level_name`, `description`, `sla_multiplier`, `max_concurrent_tickets`, `escalation_time_hours`, `created_at`, `updated_at`) VALUES ('slc-test-003', 'Normal 站点', '普通站点配置', NULL, 5, 4, '2026-01-21 02:17:44', '2026-01-21 02:17:44');
COMMIT;

-- ----------------------------
-- Table structure for sites
-- ----------------------------
DROP TABLE IF EXISTS `sites`;
CREATE TABLE `sites` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ONLINE','OFFLINE','UNDER_CONSTRUCTION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ONLINE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_sites_name` (`name`),
  KEY `idx_sites_status` (`status`),
  KEY `idx_site_name` (`name`),
  KEY `idx_site_status` (`status`),
  KEY `idx_site_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sites
-- ----------------------------
BEGIN;
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-norm-001', '上海浦东金桥充电站', '上海市浦东新区金桥路', 'normal', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-norm-002', '北京西单商圈充电站', '北京市西城区西单', 'normal', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-norm-003', '深圳罗湖东门步行街站', '深圳市罗湖区东门', 'vip', 'OFFLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-vip-001', '上海陆家嘴超级充电站', '上海市浦东新区陆家嘴环路1000号东方明珠旁', 'vip', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-vip-002', '上海虹桥枢纽充电站', '上海市闵行区申虹路2800号虹桥机场内', 'vip', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-vip-003', '北京国贸CBD超级站', '北京市朝阳区建国门外大街1号国贸中心', 'vip', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
INSERT INTO `sites` (`id`, `name`, `address`, `level`, `status`, `created_at`, `updated_at`) VALUES ('test-site-vip-004', '深圳福田中心区站', '深圳市福田区深南大道6008号特区报业大厦', 'vip', 'ONLINE', '2026-01-21 02:18:05', '2026-01-21 02:18:05');
COMMIT;

-- ----------------------------
-- Table structure for sla_configs
-- ----------------------------
DROP TABLE IF EXISTS `sla_configs`;
CREATE TABLE `sla_configs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('P1','P2','P3','P4') COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_time_minutes` int NOT NULL DEFAULT '60',
  `completion_time_hours` int NOT NULL DEFAULT '24',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sla_configs
-- ----------------------------
BEGIN;
INSERT INTO `sla_configs` (`id`, `priority`, `response_time_minutes`, `completion_time_hours`, `created_at`, `updated_at`) VALUES ('sla-p1', 'P1', 120, 24, '2026-01-16 03:20:33', '2026-01-16 03:20:33');
INSERT INTO `sla_configs` (`id`, `priority`, `response_time_minutes`, `completion_time_hours`, `created_at`, `updated_at`) VALUES ('sla-p2', 'P2', 240, 24, '2026-01-16 03:20:33', '2026-01-16 03:20:33');
INSERT INTO `sla_configs` (`id`, `priority`, `response_time_minutes`, `completion_time_hours`, `created_at`, `updated_at`) VALUES ('sla-p3', 'P3', 360, 24, '2026-01-16 03:20:33', '2026-01-16 03:20:33');
INSERT INTO `sla_configs` (`id`, `priority`, `response_time_minutes`, `completion_time_hours`, `created_at`, `updated_at`) VALUES ('sla-p4', 'P4', 480, 24, '2026-01-16 03:20:33', '2026-01-16 03:20:33');
COMMIT;

-- ----------------------------
-- Table structure for template_fields
-- ----------------------------
DROP TABLE IF EXISTS `template_fields`;
CREATE TABLE `template_fields` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_type` enum('TEXT','NUMBER','DATE','SELECT','MULTISELECT','FILE','TEXTAREA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0',
  `options` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` enum('TEXT','NUMBER','DATE','LOCATION','PHOTO','SIGNATURE','FACE_RECOGNITION') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fields_step_id` (`step_id`),
  CONSTRAINT `template_fields_ibfk_1` FOREIGN KEY (`step_id`) REFERENCES `template_steps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of template_fields
-- ----------------------------
BEGIN;
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('04cba3a3-f84b-4222-85ea-1754a5cfe10e', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '文本', 'TEXT', 1, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('2134c4b9-f142-4229-a2a4-9e3b84af7829', '89c52bbd-1bbd-4497-a252-ebea8fef3a9c', '', 'TEXT', 1, NULL, '2026-01-30 12:22:10', '2026-01-30 12:22:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('2ff37cc7-7805-4bc2-8044-c98c7b1934bd', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '照片', 'TEXT', 1, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'PHOTO');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('35e5310d-c5ac-4c0e-b76c-6bcc50ecb0e5', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '签名', 'TEXT', 1, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'SIGNATURE');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('512dfe74-28c9-47e3-b840-0c49fbbfc097', '3381fc6b-0983-43b7-bcc7-298b661446b8', '新字段', 'TEXT', 1, NULL, '2026-01-21 01:03:59', '2026-01-21 01:03:59', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('54873259-0df7-459b-8bcb-4f26a5c6d2ac', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '数字', 'TEXT', 1, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'NUMBER');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('55749faa-18fd-44ff-84e7-ba7e4a0db544', 'c120eaee-c5a1-477b-beb8-1fe6eec19b20', '文本字段', 'TEXT', 1, NULL, '2026-01-30 12:25:27', '2026-01-30 12:25:27', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('73aae64f-5fd5-43a4-85d0-1ffdd544eb8d', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '位置', 'TEXT', 1, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'LOCATION');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('e4a58547-0211-405d-a49a-a114013a09f1', '60b376b6-0fd4-4a6c-9708-caeea6171b50', '日期', 'TEXT', 0, NULL, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 'DATE');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-001', 'ts-002', '故障现象', 'TEXTAREA', 1, NULL, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-002', 'ts-002', '故障原因', 'SELECT', 1, '设备老化|人为损坏|软件故障|其他', '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-003', 'ts-003', '更换配件', 'TEXT', 0, NULL, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-004', 'ts-003', '维修措施', 'TEXTAREA', 1, NULL, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-005', 'ts-004', '测试结果', 'SELECT', 1, '正常|异常', '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
INSERT INTO `template_fields` (`id`, `step_id`, `name`, `field_type`, `required`, `options`, `created_at`, `updated_at`, `type`) VALUES ('tf-006', 'ts-004', '测试备注', 'TEXTAREA', 0, NULL, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 'TEXT');
COMMIT;

-- ----------------------------
-- Table structure for template_steps
-- ----------------------------
DROP TABLE IF EXISTS `template_steps`;
CREATE TABLE `template_steps` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `step_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sort_order` int DEFAULT '0' COMMENT '排序序号',
  PRIMARY KEY (`id`),
  KEY `idx_steps_template_id` (`template_id`),
  CONSTRAINT `template_steps_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of template_steps
-- ----------------------------
BEGIN;
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('3381fc6b-0983-43b7-bcc7-298b661446b8', '5ef98f4e-40b0-48a8-853e-da5bb6cd3ff8', '更新后的步骤1', '更新后的步骤描述', 0, '2026-01-21 01:03:59', '2026-01-21 01:03:59', 1);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('60b376b6-0fd4-4a6c-9708-caeea6171b50', '3944985a-893b-4e37-abbf-9e1f87247552', '步骤1', NULL, 0, '2026-01-21 01:03:52', '2026-01-21 01:03:52', 1);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('89c52bbd-1bbd-4497-a252-ebea8fef3a9c', '86607903-e3f7-442d-90fb-938f093f7b2b', '第一步', '第一步描述', 0, '2026-01-30 12:22:10', '2026-01-30 12:22:10', 1);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('c120eaee-c5a1-477b-beb8-1fe6eec19b20', '10766aa1-530c-4cc0-8287-6bb832d8c497', '步骤1', NULL, 0, '2026-01-30 12:25:27', '2026-01-30 12:25:27', 1);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-001', 'tmpl-001', '现场签到', '到达现场后签到打卡', 1, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-002', 'tmpl-001', '故障诊断', '检查设备故障原因', 2, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-003', 'tmpl-001', '维修处理', '进行故障维修', 3, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-004', 'tmpl-001', '功能测试', '维修后进行功能测试', 4, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-005', 'tmpl-001', '现场签退', '完成工作后签退', 5, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-006', 'tmpl-002', '快速响应', '快速到达现场', 1, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-007', 'tmpl-002', '紧急处理', '进行紧急故障处理', 2, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
INSERT INTO `template_steps` (`id`, `template_id`, `name`, `description`, `step_order`, `created_at`, `updated_at`, `sort_order`) VALUES ('ts-008', 'tmpl-002', '验证恢复', '验证设备恢复正常', 3, '2026-01-11 02:40:10', '2026-01-11 02:40:10', 0);
COMMIT;

-- ----------------------------
-- Table structure for templates
-- ----------------------------
DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of templates
-- ----------------------------
BEGIN;
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('10766aa1-530c-4cc0-8287-6bb832d8c497', 'API测试模板', '通过API创建', '2026-01-30 12:25:27', '2026-01-30 12:25:27');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('3944985a-893b-4e37-abbf-9e1f87247552', '测试模板_1768928632', '测试所有字段类型', '2026-01-21 01:03:52', '2026-01-21 01:03:52');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('5ef98f4e-40b0-48a8-853e-da5bb6cd3ff8', '更新后的模板_1768928639', '这是更新后的模板描述 - 2026年 1月21日 星期三 01时03分59秒 CST', '2026-01-21 01:03:58', '2026-01-21 01:03:58');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('86607903-e3f7-442d-90fb-938f093f7b2b', '测试工单模版', '测试工单模版 详细信息', '2026-01-30 12:22:10', '2026-01-30 12:22:10');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('tmpl-001', '标准检修流程', '常规设备检修标准流程', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('tmpl-002', '紧急故障处理', '紧急故障快速响应流程', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('tmpl-003', '设备更换流程', '设备更换标准操作流程', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
INSERT INTO `templates` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES ('tmpl-004', '网络故障排查', '网络故障诊断与修复流程', '2026-01-11 02:40:10', '2026-01-11 02:40:10');
COMMIT;

-- ----------------------------
-- Table structure for ticket_comments
-- ----------------------------
DROP TABLE IF EXISTS `ticket_comments`;
CREATE TABLE `ticket_comments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment_type` enum('GENERAL','COMMENT','ACCEPT','DECLINE','CANCEL','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMMENT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('GENERAL','COMMENT','ACCEPT','DECLINE','CANCEL','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comments_ticket_id` (`ticket_id`),
  KEY `idx_comments_user_id` (`user_id`),
  KEY `idx_comment_ticket_id` (`ticket_id`),
  KEY `idx_comment_user_id` (`user_id`),
  KEY `idx_comment_created_at` (`created_at`),
  CONSTRAINT `ticket_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of ticket_comments
-- ----------------------------
BEGIN;
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `comment`, `comment_type`, `created_at`, `type`) VALUES ('15d960fd-8e3b-4b0d-bd9a-124713691443', '2016514945845936129', 'eng-002', 'I will handle this ticket', 'COMMENT', '2026-01-28 22:13:40', 'ACCEPT');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `comment`, `comment_type`, `created_at`, `type`) VALUES ('3160a0b7-82d7-46c3-8ecf-d9fa865420a2', '2016513824382779394', 'eng-002', 'I will handle this ticket', 'COMMENT', '2026-01-28 22:09:12', 'ACCEPT');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `comment`, `comment_type`, `created_at`, `type`) VALUES ('4d35d477-31ab-45af-8bd4-01aeda998b4f', '2016511405380861953', 'eng-002', '我接受这个工单', 'COMMENT', '2026-01-28 21:59:38', 'ACCEPT');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `comment`, `comment_type`, `created_at`, `type`) VALUES ('tc-001', 'ticket-001', 'eng-001', '已到达现场，正在排查故障', 'GENERAL', '2026-01-11 02:40:10', 'GENERAL');
COMMIT;

-- ----------------------------
-- Table structure for tickets
-- ----------------------------
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','ASSIGNED','ACCEPTED','DEPARTED','ARRIVED','REVIEW','COMPLETED','ON_HOLD','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `accepted` tinyint(1) DEFAULT '0',
  `accepted_at` timestamp NULL DEFAULT NULL,
  `departure_at` timestamp NULL DEFAULT NULL,
  `departure_photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrival_at` timestamp NULL DEFAULT NULL,
  `arrival_photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completion_photo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cause` text COLLATE utf8mb4_unicode_ci,
  `solution` text COLLATE utf8mb4_unicode_ci,
  `completed_steps` json DEFAULT NULL,
  `step_data` json DEFAULT NULL,
  `related_ticket_ids` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `problem_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2017121534270771203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of tickets
-- ----------------------------
BEGIN;
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601110001, '充电桩无法启动', '2号充电桩按启动按钮无反应', 'MAINTENANCE', 'COMPLETED', 'HIGH', 'site-001', 'tmpl-001', 'eng-002', 'admin-001', '2026-01-11 10:40:10', 1, '2026-01-28 13:41:36', '2026-01-28 21:57:46', NULL, '2026-01-31 17:15:55', NULL, NULL, NULL, NULL, '[]', '{}', NULL, '2026-01-11 02:40:10', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601110002, '显示屏花屏', '充电桩显示屏出现花屏现象', 'MAINTENANCE', 'REVIEW', 'MEDIUM', 'site-002', 'tmpl-001', 'eng-002', 'admin-001', '2026-01-12 02:40:10', 1, '2026-01-31 04:03:18', '2026-01-31 11:59:34', NULL, '2026-01-31 22:48:44', NULL, NULL, NULL, NULL, '[]', '{}', NULL, '2026-01-11 02:40:10', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601130001, '测试工单', '测试描述', 'CORRECTIVE', 'ARRIVED', 'P2', 'site-001', 'tmpl-001', 'eng-002', 'admin-001', '2026-01-20 10:00:00', 1, '2026-01-31 04:59:17', '2026-01-31 12:51:09', NULL, '2026-01-31 17:19:24', NULL, NULL, NULL, '222244', NULL, '{\"steps\": [{\"id\": \"ts-001\", \"name\": \"现场签到\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"到达现场后签到打卡\"}, {\"id\": \"ts-002\", \"name\": \"故障诊断\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"检查设备故障原因\"}, {\"id\": \"ts-003\", \"name\": \"维修处理\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"进行故障维修\"}, {\"id\": \"ts-004\", \"name\": \"功能测试\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"维修后进行功能测试\"}, {\"id\": \"ts-005\", \"name\": \"现场签退\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"完成工作后签退\"}]}', NULL, '2026-01-13 03:06:42', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601130002, '问题工单', NULL, 'PROBLEM', 'ACCEPTED', 'P1', NULL, 'tmpl-001', 'eng-002', 'admin-001', '2026-01-20 10:00:00', 1, '2026-01-31 05:00:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[\"0dfb09c9-081a-420f-a243-259893588eab\"]', '2026-01-13 03:08:02', '2026-01-28 02:05:00', 'pt-001');
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601200001, 'TestTicket_1768921348', '测试工单 - 创建于 2026年 1月20日 星期二 23时02分28秒 CST', 'CORRECTIVE', 'ACCEPTED', 'P2', NULL, 'tmpl-001', 'eng-002', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-31 05:01:18', NULL, NULL, NULL, NULL, NULL, '{\"approved\": true, \"comment\": \"审核通过\"}', NULL, NULL, NULL, NULL, '2026-01-20 23:02:28', '2026-01-28 02:05:00', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601200002, '更新后的工单标题', '这是更新后的描述', 'CORRECTIVE', 'ACCEPTED', 'P1', NULL, 'tmpl-001', 'eng-002', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-31 09:36:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-20 23:14:11', '2026-01-28 02:05:00', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601210001, '更新后的工单标题', '这是更新后的描述', 'CORRECTIVE', 'ACCEPTED', 'P1', NULL, 'tmpl-001', 'eng-002', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-31 15:59:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 00:18:05', '2026-01-28 02:05:00', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601210002, 'E2E测试工单_1768925929', '端到端完整流程测试 - 创建于 2026年 1月21日 星期三 00时18分49秒 CST', 'CORRECTIVE', 'OPEN', 'P2', NULL, 'tmpl-001', '241604a7-c0f1-40c8-91bd-02cddcc4b6db', 'admin-001', '2026-02-01 00:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 00:18:49', '2026-01-28 02:05:00', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601210003, 'E2E测试工单_1768925952', '端到端完整流程测试 - 创建于 2026年 1月21日 星期三 00时19分12秒 CST', 'CORRECTIVE', 'DEPARTED', 'P2', NULL, 'tmpl-001', '241604a7-c0f1-40c8-91bd-02cddcc4b6db', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-21 00:19:12', '2026-01-21 00:19:12', NULL, '2026-01-21 00:19:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 00:19:12', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601210004, 'E2E测试工单_1768925994', '端到端完整流程测试 - 创建于 2026年 1月21日 星期三 00时19分54秒 CST', 'CORRECTIVE', 'DEPARTED', 'P2', NULL, 'tmpl-001', '241604a7-c0f1-40c8-91bd-02cddcc4b6db', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-21 00:19:55', '2026-01-21 00:19:55', NULL, '2026-01-21 00:19:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-21 00:19:54', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (202601210005, 'E2E测试工单_1768926108', '端到端完整流程测试 - 创建于 2026年 1月21日 星期三 00时21分48秒 CST', 'CORRECTIVE', 'OPEN', 'P2', NULL, 'tmpl-001', '241604a7-c0f1-40c8-91bd-02cddcc4b6db', 'admin-001', '2026-02-01 00:00:00', 1, '2026-01-21 00:21:49', '2026-01-21 00:21:49', NULL, '2026-01-21 00:21:49', NULL, '\"completed-photo-url\"', '{\"comment\": \"工作质量良好，审核通过\"}', NULL, NULL, NULL, NULL, '2026-01-21 00:21:48', '2026-01-28 02:05:00', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (2016511405380861953, '预防性维护测试工单', '测试步骤更新功能', 'PREVENTIVE', 'DEPARTED', 'MEDIUM', 'site-001', 'tmpl-001', 'eng-002', '20973aa9-fcf5-4ad6-afac-37905acc5737', '2026-02-04 21:59:18', 1, '2026-01-28 21:59:38', '2026-01-28 21:59:38', NULL, '2026-01-28 21:59:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 21:59:18', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (2016513824382779394, 'Test Preventive Maintenance with Steps', 'Testing step initialization from template', 'PREVENTIVE', 'DEPARTED', 'HIGH', 'site-001', 'tmpl-001', 'eng-002', '20973aa9-fcf5-4ad6-afac-37905acc5737', '2026-02-01 10:00:00', 1, '2026-01-28 22:09:13', '2026-01-28 22:09:13', '{\"departurePhoto\": \"http://example.com/departure.jpg\"}', '2026-01-28 22:09:13', '{\"arrivalPhoto\": \"http://example.com/arrival.jpg\"}', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 22:08:55', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (2016514945845936129, 'Test Step Initialization - New Ticket', 'Testing step initialization from template', 'PREVENTIVE', 'DEPARTED', 'HIGH', 'site-001', 'tmpl-001', 'eng-002', '20973aa9-fcf5-4ad6-afac-37905acc5737', '2026-02-01 10:00:00', 1, '2026-01-28 22:13:41', '2026-01-28 22:13:41', '{\"departurePhoto\": \"http://example.com/departure.jpg\"}', '2026-01-28 22:13:41', '{\"arrivalPhoto\": \"http://example.com/arrival.jpg\"}', NULL, NULL, NULL, NULL, '{\"steps\": [{\"id\": \"ts-001\", \"name\": \"现场签到\", \"status\": \"pass\", \"completed\": true, \"sortOrder\": 0, \"description\": \"Completed successfully\"}, {\"id\": \"ts-002\", \"name\": \"故障诊断\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"检查设备故障原因\"}, {\"id\": \"ts-003\", \"name\": \"维修处理\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"进行故障维修\"}, {\"id\": \"ts-004\", \"name\": \"功能测试\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"维修后进行功能测试\"}, {\"id\": \"ts-005\", \"name\": \"现场签退\", \"status\": \"pending\", \"completed\": false, \"sortOrder\": 0, \"description\": \"完成工作后签退\"}]}', NULL, '2026-01-28 22:13:22', '2026-01-31 14:34:24', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `type`, `status`, `priority`, `site`, `template_id`, `assigned_to`, `created_by`, `due_date`, `accepted`, `accepted_at`, `departure_at`, `departure_photo`, `arrival_at`, `arrival_photo`, `completion_photo`, `cause`, `solution`, `completed_steps`, `step_data`, `related_ticket_ids`, `created_at`, `updated_at`, `problem_type`) VALUES (2017121534270771202, '1111', '2222', 'PREVENTIVE', 'OPEN', 'low', NULL, '3944985a-893b-4e37-abbf-9e1f87247552', 'eng-002', '59d30476-19f4-4a9a-a625-2c9542fbe851', '2026-01-30 06:22:52', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-30 14:23:44', '2026-01-30 14:23:44', NULL);
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hashed_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','MANAGER','ENGINEER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENGINEER',
  `group_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_group_id` (`group_id`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_status` (`status`),
  KEY `idx_user_username` (`username`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('092fe87d-482c-4fb1-bb90-5cc437329dc5', 'Test User New', 'testuser_new', 'testuser_new@igreen.com', NULL, '$2a$10$tC9qbh0Mw9gzujBI1pP2/ue2t.vFrk1Y.vkEjFl/cTGgN7747U9qK', 'ENGINEER', NULL, 'ACTIVE', '2026-01-30 20:10:29', '2026-01-30 20:10:29', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('12248903-2766-4cb6-b661-00cbe2cdf5f6', 'Test User', 'testuser', 'testuser@igreen.com', NULL, '$2a$10$beIA4TTEj46nomMSO4frPOFhnN8Rv5GlecWYVQv9/1NSBUgx9N1Gm', 'ENGINEER', NULL, 'ACTIVE', '2026-01-30 20:03:53', '2026-01-30 20:03:53', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('15dd3cfb-2f18-477d-bdfe-94f96f661db1', 'Debug', 'testdebug', 'testdebug@igreen.com', NULL, '$2a$10$yUv398niHHuL/3H.Ny515OJJ8fAAVOQnykMPcTPSYzLIpHxBAffuK', 'ENGINEER', '98fcedb6-fa1e-4db3-8270-706cf5046651', 'ACTIVE', '2026-01-30 20:17:13', '2026-01-30 20:17:13', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('20973aa9-fcf5-4ad6-afac-37905acc5737', '123', '123', '123@igreen.com', NULL, '$2a$10$Z5TNzHznBm/LIZ9L0/Q.GuRevWb1r8x/seYqz.wUJw7b8tnRfekLy', 'ADMIN', NULL, 'ACTIVE', '2026-01-12 04:44:11', '2026-01-12 04:44:11', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('241604a7-c0f1-40c8-91bd-02cddcc4b6db', '测试工程师_1768922385', 'engineer_1768922385', 'engineer_1768922385@igreen.com', NULL, '$2a$10$kgm4DH3MgulRkP4lwjIUC.tqACPKQt3sRZADRP2VPfqUsVsi5SpWm', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 23:19:45', '2026-01-20 23:19:45', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('28d07279-754d-4063-b608-3114197a003a', 'Test Final2', 'testfinal2', 'testfinal2@igreen.com', NULL, '$2a$10$JOx7n1787tYaOV44Q6B04uFTt0d7z77s4y46LlICxy7KMAyMwIJiC', 'MANAGER', '4aec8a22-62e3-466c-b147-33f79402f060', 'ACTIVE', '2026-01-30 20:17:37', '2026-01-30 20:17:37', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('324b17f0-5296-4afa-a351-3230cffd28b9', '测试用户5', 'testuser_17689126005', 'testuser_17689126005@igreen.com', NULL, '$2a$10$G98sjTSHlkgRJspFpXaiHOoDLfMVQDETM1qJpz.p2FTNiPisdNMZi', 'ENGINEER', 'd5e1cc92-429e-4dac-aba7-f3e780eace4d', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('45102921-134f-4d4e-a199-c85daa518061', '测试用户_3', 'testuser_3', 'testuser_3@igreen.com', NULL, '$2a$10$OmXT5mkGadJK.AhnJDHA1etwNe9NXX3PeYaNRWVGRJ8PFRrN6R7GS', 'ENGINEER', NULL, 'ACTIVE', '2026-01-21 00:17:33', '2026-01-21 00:17:33', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('4f52e4c5-a934-4bc8-b57d-0dfbde77e037', '系统管理员', 'admin2', 'admin2@igreen.com', NULL, '$2a$10$4sbZ4fTiGgsbYUWlPOUT6O6AsC5Myqk3.voaJcSNV6r0Cu88O2aZW', 'ADMIN', NULL, 'ACTIVE', '2026-02-03 23:15:57', '2026-02-03 23:15:57', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('59d30476-19f4-4a9a-a625-2c9542fbe851', 'System Admin', 'admin', 'admin@igreen.com', NULL, '$2a$10$JNDXBkDmZ63ky61iCDuEO.8dXgX8g9HIK8rA7U25tIpNF2.8v1HUy', 'ADMIN', NULL, 'ACTIVE', '2026-01-30 12:20:37', '2026-01-30 12:20:37', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('5adfda93-3ef4-4c60-bfea-8b9cb7a79088', '更新后的用户', 'TestUser_1768912084', 'testuser_1768912084@igreen.com', NULL, '$2a$10$w726ufvOrmtMJ7aRCczGGOavCXtlk38M/IdebOaA/qZCBLuAQWJ9O', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 20:28:04', '2026-01-20 20:28:04', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('627bfa1f-80f1-48f1-b1cc-a6c5911313ff', '更新后的用户', 'TestUser_1768911913', 'testuser_1768911913@igreen.com', NULL, '$2a$10$NSsITSPpBDQpGrmEZXlAWucaE9ZeEtwMn0qoBV8LZrqCOk9wtTFH2', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 20:25:13', '2026-01-20 20:25:13', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('63855c77-3ab6-43a3-987a-3a9443425fb9', '测试用户', 'TestUser_1768911717', 'testuser_1768911717@igreen.com', NULL, '$2a$10$djz0u266BI3FIZwH41nYE.z.hl2ouqLpt5vbYoRvjqp5injXkrmOG', 'ENGINEER', 'group-004', 'ACTIVE', '2026-01-20 20:21:57', '2026-01-20 20:21:57', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('66c50e11-3f6e-42e6-9f60-220683238c98', '测试工程师_1768925871', 'engineer_1768925871', 'engineer_1768925871@igreen.com', NULL, '$2a$10$5lf4lvjmJkvnjiqwXpSfe.tyChRfFwXuMcDkZ2AFUF2gmb2thTKCW', 'ENGINEER', NULL, 'ACTIVE', '2026-01-21 00:17:51', '2026-01-21 00:17:51', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('682e9865-90bc-4557-b625-13273245b7cc', '测试用户10', 'testuser_176891260110', 'testuser_176891260110@igreen.com', NULL, '$2a$10$x5yWHwm7k5HL8oqT0PBhVu9dA8FDTR2/UrEOrQDMCFdDqjBNl3Wa6', 'ENGINEER', '4aec8a22-62e3-466c-b147-33f79402f060', 'ACTIVE', '2026-01-20 20:36:41', '2026-01-20 20:36:41', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('6898a792-5aa6-48ac-921f-5e988a87f218', '测试用户2', 'testuser_17689125992', 'testuser_17689125992@igreen.com', NULL, '$2a$10$ggd53bm7572PaRnXJzjeg.BG.JgvAybHdB5Kb2zrVSn6dTghjuReS', 'ENGINEER', 'group-002', 'ACTIVE', '2026-01-20 20:36:39', '2026-01-20 20:36:39', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('69f2be91-67ee-491d-8286-6f00174110e0', '18222204219', '那拉敬阳', '那拉敬阳@igreen.com', NULL, '$2a$10$0onmx/.8CxoV7GO4gD1U1uLukYZh3.IylW.ukVUOjbUuq0Z9uUAyi', 'MANAGER', NULL, 'ACTIVE', '2026-01-13 16:07:53', '2026-01-13 16:07:53', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('6aff970d-a65a-4068-b9f7-84052cd23f86', 'Test Final', 'test_final', 'test_final@igreen.com', NULL, '$2a$10$lZkcJL2FU.0jn6Y.ulrUEedtpaLIXxCljwDNeGKOYt/fluXyyt79e', 'ENGINEER', NULL, 'ACTIVE', '2026-01-30 20:14:34', '2026-01-30 20:14:34', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('7808fd19-9639-42eb-9505-13cc9dedda50', '测试用户3', 'testuser_17689126003', 'testuser_17689126003@igreen.com', NULL, '$2a$10$J3Zcyjbvri2sAeh6DahfzOC4OXoNxtcFJEWqjcNAxvsrJrq7Kvrhm', 'ENGINEER', '98fcedb6-fa1e-4db3-8270-706cf5046651', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('7e9f4bd9-8a3e-418d-b4ae-429bbc915cb6', '测试管理员', 'testadmin', 'testadmin@igreen.com', NULL, '$2a$10$Mi.zh3HCfSRJ3FZ/bsO8dOo4pIQBQwWIVvikYNhPgaBK1vMLkfLha', 'ADMIN', NULL, 'ACTIVE', '2026-01-21 02:07:34', '2026-01-21 02:07:34', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('80bb397c-2572-479c-8512-d5d4886cd9b3', '测试用户4', 'testuser_17689126004', 'testuser_17689126004@igreen.com', NULL, '$2a$10$pWG5FovXXH4wAR.XxlVZduMiQV5wp0HNN5Mg9LT4x7q4l8Ui4/0.i', 'ENGINEER', 'd5e1cc92-429e-4dac-aba7-f3e780eace4d', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('84af9acd-24fd-485c-8f0b-a769c2a5b78a', '张三', 'zhangsan2025', 'zhangsan2025@igreen.com', NULL, '$2a$10$2SJxVjOzsa6D8SdTqYOwqe6GKPKu/8REsTdrtXq4KlnSykDn2Z1.y', 'ADMIN', NULL, 'ACTIVE', '2026-01-13 16:25:04', '2026-01-13 16:25:04', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('859c8061-c0a0-4204-815f-79bb661287ac', '测试用户1', 'testuser_17689125991', 'testuser_17689125991@igreen.com', NULL, '$2a$10$MNZK61N5338EYur7mqrV1eHe9pXZ18GA7YWCWTAUpi/Q7cEZiTbbS', 'ENGINEER', 'group-003', 'ACTIVE', '2026-01-20 20:36:39', '2026-01-20 20:36:39', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('92dfd699-5b87-4c40-8190-eee64e871fb4', '新测试用户', 'newuser999', 'newuser999@igreen.com', NULL, '$2a$10$ycafQL9yeU2bKM8SdSAhp.jQZqOtWh66Da2SmqQPf.M4wh1TQArl2', 'ENGINEER', NULL, 'ACTIVE', '2026-02-03 23:14:21', '2026-02-03 23:14:21', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('992be99d-a147-4bbb-aeb2-8427addc2c98', '测试用户9', 'testuser_17689126009', 'testuser_17689126009@igreen.com', NULL, '$2a$10$J8dcyJVXyx2XYIJlvu/Oj.EIW.ujMNZYCOyhTqJ830XVf178X0Zgu', 'ENGINEER', '4aec8a22-62e3-466c-b147-33f79402f060', 'ACTIVE', '2026-01-20 20:36:41', '2026-01-20 20:36:41', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('9e7129c8-743e-4f29-a92e-3c80119e1fdc', '测试用户7', 'testuser_17689126007', 'testuser_17689126007@igreen.com', NULL, '$2a$10$T4Q5zT4gzmtmKzgjLoMu2OrFlqVqqcwkSRPbmzHk.tNRvljahI/Ku', 'ENGINEER', 'ff11bb8d-795f-433a-a6f3-161dada632ce', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('a5c81830-451c-4f2a-ac79-2cb6801c22e2', '更新后的用户', 'TestUser_1768911958', 'testuser_1768911958@igreen.com', NULL, '$2a$10$O9nzIlhuBCFLLZbgRgf2U.BBacBP.slWvDbaWDVaHqi1DPV5ZjUQO', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 20:25:58', '2026-01-20 20:25:58', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('adeac9c1-c3da-4a29-a1b3-6f824c324ba7', '16639250117', '粟国英', '粟国英@igreen.com', NULL, '$2a$10$PuIig6N51mEa2E.eBgs.Qepr7rqLx18.2xDo7MJWFsploNj137hUy', 'MANAGER', NULL, 'ACTIVE', '2026-01-13 16:07:03', '2026-01-13 16:07:03', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('b3f6cd8e-4251-4e54-bddd-7db970bf8859', '测试用户_2', 'testuser_2', 'testuser_2@igreen.com', NULL, '$2a$10$5UiDAtj801fpUKiZrT39A.vzeelaCh8tgbVP7v11i6Oy51ystuzHK', 'ENGINEER', NULL, 'ACTIVE', '2026-01-21 00:17:32', '2026-01-21 00:17:32', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('b4a1427f-2aad-4fc4-b8c0-f3adda6e0419', 'Test Import', 'test_import_final', 'test_import_final@igreen.com', NULL, '$2a$10$y4YtpohME103oBTJ6.DSoOKjHuQ4ju0RqDDzkawEOXiZtwZsEkCeS', 'ENGINEER', NULL, 'ACTIVE', '2026-01-30 20:17:02', '2026-01-30 20:17:02', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('bff276db-4961-4f36-84b5-9f85bc3b6d23', '测试工程师', 'engineer_1768922212', 'engineer_1768922212@igreen.com', NULL, '$2a$10$/2RJmq74LA3ZTycGFcuvB.KXnDEreJ6vPdETbOQ.drvgXcMBAqbi.', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 23:16:52', '2026-01-20 23:16:52', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('d95919e3-8193-4d09-b5d9-75f05c198211', '13099949596', '孟立伟', '孟立伟@igreen.com', NULL, '$2a$10$SiLGN1x.uo8raCSYNSbkeOmqaXDlD7.f91nw.CleLvtuUXVl8R3v2', 'MANAGER', NULL, 'ACTIVE', '2026-01-13 16:05:54', '2026-01-13 16:05:54', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('de6a749b-c1ae-43bb-8169-92eace0d80e9', '测试用户_1', 'testuser_1', 'testuser_1@igreen.com', NULL, '$2a$10$WpmkgOS693kXhVeXpFy4zenWp8PcfNNEQGf07/mGbYmh5cW6DhC9i', 'ENGINEER', NULL, 'ACTIVE', '2026-01-21 00:17:32', '2026-01-21 00:17:32', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('e0bd7f00-d817-4721-bd7d-a18be7620ef0', '14756969191', '善家豪', '善家豪@igreen.com', NULL, '$2a$10$sma2bNUMrK6uCJ24dAV3LOsOIqM6un.MCdGrWVYK7cDFBWDPjnwAu', 'MANAGER', NULL, 'ACTIVE', '2026-01-13 16:09:46', '2026-01-13 16:09:46', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('e2046d68-f0d6-43dc-aecc-5641f3bf0121', '测试用户6', 'testuser_17689126006', 'testuser_17689126006@igreen.com', NULL, '$2a$10$vt8qMB7xOiEQDvIOlB3NmOw1LNSERR1rpO4qa3Vdmu/d6Peb6iUX6', 'ENGINEER', 'group-001', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('e7c86cb4-7582-4167-9a7e-2176e30d54e1', '更新后的用户', 'TestUser_1768911965', 'testuser_1768911965@igreen.com', NULL, '$2a$10$zGJ.m9KXlR4EhB3vpky0aebqSHeqf6f1PYv6MLh9qQEm8pWj2tBrK', 'ENGINEER', NULL, 'ACTIVE', '2026-01-20 20:26:06', '2026-01-20 20:26:06', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('eng-001', '张三工程师', 'zhangsan', 'zhangsan@igreen.com', NULL, '$2a$10$IeIp1Up065tumGYcPIGaSuidTY6h7NYetXB1NRmah5j2hRmwdh4.O', 'ENGINEER', 'group-001', 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 19:21:49', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('eng-002', 'Li Si Updated', 'lisi', 'lisi@igreen.com', '+86-13800138000', '$2a$10$IeIp1Up065tumGYcPIGaSuidTY6h7NYetXB1NRmah5j2hRmwdh4.O', 'ENGINEER', 'group-001', 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 19:21:49', 'CN');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('eng-003', '王五工程师', 'wangwu', 'wangwu@igreen.com', NULL, '$2a$10$IeIp1Up065tumGYcPIGaSuidTY6h7NYetXB1NRmah5j2hRmwdh4.O', 'ENGINEER', 'group-002', 'ACTIVE', '2026-01-11 02:40:10', '2026-01-11 19:21:49', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('fa662131-5782-4566-abd6-d16e9643a6e9', '17370824503', '卫文韬', '卫文韬@igreen.com', NULL, '$2a$10$eAz2ik9TBXa6vTJpZdidyO4KMtUkpmVoNxaclqCAehFVeeZPxv5rO', 'MANAGER', NULL, 'ACTIVE', '2026-01-13 16:07:04', '2026-01-13 16:07:04', 'US');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('fb07f261-6a0e-4bda-8c77-3af8035b2129', 'E2E测试工程师_1768925926', 'engineer_e2e_1768925926', 'engineer_e2e_1768925926@igreen.com', NULL, '$2a$10$LOecIRbQ.IdZYBAwHV0kV.I6bugCOQ5HTt6tTdIA.yGBzyGXjquSW', 'ENGINEER', NULL, 'ACTIVE', '2026-01-21 00:18:47', '2026-01-21 00:18:47', 'Thailand');
INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `hashed_password`, `role`, `group_id`, `status`, `created_at`, `updated_at`, `country`) VALUES ('fd06dd16-e9ec-4318-abed-3229b8be8eb6', '测试用户8', 'testuser_17689126008', 'testuser_17689126008@igreen.com', NULL, '$2a$10$/HcskZ3EfJtkSQSGAydhcOVxF/amuvc76Atk8OgRPR7R3ceFc89FC', 'ENGINEER', '98fcedb6-fa1e-4db3-8270-706cf5046651', 'ACTIVE', '2026-01-20 20:36:40', '2026-01-20 20:36:40', 'Thailand');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
