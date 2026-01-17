-- 缺失的数据库表 DDL
-- 执行方式: mysql -u root -proot igreen_db < create_tables.sql

-- ============================================
-- 1. 问题类型表 (problem_types)
-- ============================================
CREATE TABLE IF NOT EXISTS problem_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- ============================================
-- 2. SLA 配置表 (sla_configs)
-- ============================================
CREATE TABLE IF NOT EXISTS sla_configs (
    id VARCHAR(36) PRIMARY KEY,
    priority VARCHAR(10) NOT NULL,
    response_time_minutes INT NOT NULL,
    completion_time_hours INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uk_priority (priority)
);

-- ============================================
-- 3. 站点级别配置表 (site_level_configs)
-- ============================================
CREATE TABLE IF NOT EXISTS site_level_configs (
    id VARCHAR(36) PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    description TEXT,
    max_concurrent_tickets INT DEFAULT 5,
    escalation_time_hours INT DEFAULT 4,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- ============================================
-- 4. 索引优化
-- ============================================
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_ticket_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_ticket_created_by ON tickets(created_by);
CREATE INDEX idx_ticket_due_date ON tickets(due_date);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_status ON users(status);
