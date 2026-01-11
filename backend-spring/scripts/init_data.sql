-- 数据库初始化脚本
-- 执行方式: mysql -u root -p igreen_db < init_data.sql

-- ============================================
-- 1. 问题类型 (Problem Types)
-- ============================================
INSERT INTO problem_types (id, name, description, created_at, updated_at) VALUES
('pt-001', '设备故障', '充电设备无法正常工作', NOW(), NOW()),
('pt-002', '网络异常', '网络连接问题导致无法通信', NOW(), NOW()),
('pt-003', '支付问题', '支付失败或退款问题', NOW(), NOW()),
('pt-004', '充电速度慢', '充电效率低于预期', NOW(), NOW()),
('pt-005', '显示屏故障', '显示屏不亮或显示异常', NOW(), NOW()),
('pt-006', '枪头损坏', '充电枪头物理损坏', NOW(), NOW()),
('pt-007', '二维码无法识别', '设备二维码扫描失败', NOW(), NOW()),
('pt-008', '其他', '其他问题类型', NOW(), NOW());

-- ============================================
-- 2. SLA 配置 (SLA Configs)
-- ============================================
INSERT INTO sla_configs (id, priority, response_time_minutes, completion_time_hours, created_at, updated_at) VALUES
('sla-001', 'P1', 30, 4, NOW(), NOW()),   -- 紧急
('sla-002', 'P2', 60, 8, NOW(), NOW()),   -- 高
('sla-003', 'P3', 120, 24, NOW(), NOW()), -- 中
('sla-004', 'P4', 240, 48, NOW(), NOW()); -- 低

-- ============================================
-- 3. 站点级别配置 (Site Level Configs)
-- ============================================
INSERT INTO site_level_configs (id, level_name, max_concurrent_tickets, escalation_time_hours, created_at, updated_at) VALUES
('slc-001', '大型站点', 10, 2, NOW(), NOW()),
('slc-002', '中型站点', 5, 4, NOW(), NOW()),
('slc-003', '小型站点', 2, 8, NOW(), NOW());

-- ============================================
-- 4. 分组 (Groups)
-- ============================================
INSERT INTO `groups` (id, name, description, status, created_at, updated_at) VALUES
('group-001', '华东区', '华东地区服务团队', 'ACTIVE', NOW(), NOW()),
('group-002', '华南区', '华南地区服务团队', 'ACTIVE', NOW(), NOW()),
('group-003', '华北区', '华北地区服务团队', 'ACTIVE', NOW(), NOW()),
('group-004', '西南区', '西南地区服务团队', 'ACTIVE', NOW(), NOW());

-- ============================================
-- 5. 站点 (Sites) - 适配现有表结构
-- ============================================
INSERT INTO sites (id, name, address, level, status, created_at, updated_at) VALUES
('site-001', '上海陆家嘴充电站', '上海市浦东新区陆家嘴环路1000号', 'VIP', 'ONLINE', NOW(), NOW()),
('site-002', '北京中关村充电站', '北京市海淀区中关村大街1号', 'VIP', 'ONLINE', NOW(), NOW()),
('site-003', '广州天河充电站', '广州市天河区体育西路111号', 'NORMAL', 'ONLINE', NOW(), NOW()),
('site-004', '深圳南山充电站', '深圳市南山区科技园路88号', 'NORMAL', 'ONLINE', NOW(), NOW()),
('site-005', '杭州西湖充电站', '杭州市西湖区文三路478号', 'NORMAL', 'ONLINE', NOW(), NOW());

-- ============================================
-- 6. 模板 (Templates) - 适配现有表结构
-- ============================================
INSERT INTO templates (id, name, description, created_at, updated_at) VALUES
('tmpl-001', '标准检修流程', '常规设备检修标准流程', NOW(), NOW()),
('tmpl-002', '紧急故障处理', '紧急故障快速响应流程', NOW(), NOW()),
('tmpl-003', '设备更换流程', '设备更换标准操作流程', NOW(), NOW()),
('tmpl-004', '网络故障排查', '网络故障诊断与修复流程', NOW(), NOW());

-- ============================================
-- 7. 模板步骤 (Template Steps) - 适配现有表结构
-- ============================================
INSERT INTO template_steps (id, template_id, step_order, name, description, created_at, updated_at) VALUES
('ts-001', 'tmpl-001', 1, '现场签到', '到达现场后签到打卡', NOW(), NOW()),
('ts-002', 'tmpl-001', 2, '故障诊断', '检查设备故障原因', NOW(), NOW()),
('ts-003', 'tmpl-001', 3, '维修处理', '进行故障维修', NOW(), NOW()),
('ts-004', 'tmpl-001', 4, '功能测试', '维修后进行功能测试', NOW(), NOW()),
('ts-005', 'tmpl-001', 5, '现场签退', '完成工作后签退', NOW(), NOW()),
('ts-006', 'tmpl-002', 1, '快速响应', '快速到达现场', NOW(), NOW()),
('ts-007', 'tmpl-002', 2, '紧急处理', '进行紧急故障处理', NOW(), NOW()),
('ts-008', 'tmpl-002', 3, '验证恢复', '验证设备恢复正常', NOW(), NOW());

-- ============================================
-- 8. 模板字段 (Template Fields) - 适配现有表结构
-- ============================================
INSERT INTO template_fields (id, step_id, name, field_type, required, options, created_at, updated_at) VALUES
('tf-001', 'ts-002', '故障现象', 'TEXTAREA', 1, NULL, NOW(), NOW()),
('tf-002', 'ts-002', '故障原因', 'SELECT', 1, '设备老化|人为损坏|软件故障|其他', NOW(), NOW()),
('tf-003', 'ts-003', '更换配件', 'TEXT', 0, NULL, NOW(), NOW()),
('tf-004', 'ts-003', '维修措施', 'TEXTAREA', 1, NULL, NOW(), NOW()),
('tf-005', 'ts-004', '测试结果', 'SELECT', 1, '正常|异常', NOW(), NOW()),
('tf-006', 'ts-004', '测试备注', 'TEXTAREA', 0, NULL, NOW(), NOW());

-- ============================================
-- 9. 管理员用户 (Admin User)
-- ============================================
INSERT INTO users (id, name, username, email, hashed_password, role, status, group_id, created_at, updated_at) VALUES
('admin-001', '系统管理员', 'admin', 'admin@igreen.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', 'ACTIVE', 'group-001', NOW(), NOW());

-- ============================================
-- 10. 工程师用户 (Engineer Users)
-- ============================================
INSERT INTO users (id, name, username, email, hashed_password, role, status, group_id, created_at, updated_at) VALUES
('eng-001', '张三工程师', 'zhangsan', 'zhangsan@igreen.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ENGINEER', 'ACTIVE', 'group-001', NOW(), NOW()),
('eng-002', '李四工程师', 'lisi', 'lisi@igreen.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ENGINEER', 'ACTIVE', 'group-001', NOW(), NOW()),
('eng-003', '王五工程师', 'wangwu', 'wangwu@igreen.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ENGINEER', 'ACTIVE', 'group-002', NOW(), NOW());

-- 密码说明: 所有测试用户密码均为 'password123'
-- BCrypt 加密后的密码: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

-- ============================================
-- 11. 示例工单 (Sample Tickets) - 适配现有表结构
-- ============================================
INSERT INTO tickets (id, title, description, type, status, priority, site, template_id, assigned_to, created_by, due_date, accepted, created_at, updated_at, completed_steps, step_data) VALUES
('ticket-001', '充电桩无法启动', '2号充电桩按启动按钮无反应', 'MAINTENANCE', 'OPEN', 'HIGH', 'site-001', 'tmpl-001', 'eng-001', 'admin-001', DATE_ADD(NOW(), INTERVAL 8 HOUR), false, NOW(), NOW(), '[]', '{}'),
('ticket-002', '显示屏花屏', '充电桩显示屏出现花屏现象', 'MAINTENANCE', 'OPEN', 'MEDIUM', 'site-002', 'tmpl-001', 'eng-002', 'admin-001', DATE_ADD(NOW(), INTERVAL 24 HOUR), false, NOW(), NOW(), '[]', '{}');

-- ============================================
-- 12. 工单评论 (Ticket Comments) - 适配现有表结构
-- ============================================
INSERT INTO ticket_comments (id, ticket_id, user_id, comment, comment_type, created_at) VALUES
('tc-001', 'ticket-001', 'eng-001', '已到达现场，正在排查故障', 'GENERAL', NOW());
