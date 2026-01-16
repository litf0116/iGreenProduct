-- iGreen Database Schema
-- Migration from FastAPI to Spring Boot 3 + Java 21

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'ENGINEER') NOT NULL DEFAULT 'ENGINEER',
    group_id VARCHAR(36),
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `groups` (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    level ENUM('normal', 'vip', 'enterprise') DEFAULT 'normal',
    status ENUM('ONLINE', 'OFFLINE', 'MAINTENANCE') NOT NULL DEFAULT 'ONLINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sites_name (name),
    INDEX idx_sites_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS template_steps (
    id VARCHAR(36) PRIMARY KEY,
    template_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_steps_template_id (template_id),
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS template_fields (
    id VARCHAR(36) PRIMARY KEY,
    step_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    field_type ENUM('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT', 'FILE', 'TEXTAREA') NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    options TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fields_step_id (step_id),
    FOREIGN KEY (step_id) REFERENCES template_steps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('MAINTENANCE', 'INSTALLATION', 'INSPECTION', 'REPAIR', 'EMERGENCY') NOT NULL,
    status ENUM('OPEN', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    site VARCHAR(255),
    template_id VARCHAR(36),
    assigned_to VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    due_date TIMESTAMP NULL,
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP NULL,
    departure_at TIMESTAMP NULL,
    departure_photo VARCHAR(500),
    arrival_at TIMESTAMP NULL,
    arrival_photo VARCHAR(500),
    completion_photo VARCHAR(500),
    cause TEXT,
    solution TEXT,
    completed_steps JSON,
    step_data JSON,
    related_ticket_ids JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_assigned_to (assigned_to),
    INDEX idx_tickets_created_by (created_by),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_type (type),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES templates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_comments (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    comment TEXT NOT NULL,
    comment_type ENUM('GENERAL', 'COMMENT', 'ACCEPT', 'DECLINE', 'CANCEL', 'SYSTEM') NOT NULL DEFAULT 'COMMENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comments_ticket_id (ticket_id),
    INDEX idx_comments_user_id (user_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO users (id, name, username, email, hashed_password, role, status)
VALUES ('admin-001', 'Administrator', 'admin', 'admin@igreen.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = name;

-- Insert default groups
INSERT INTO `groups` (id, name, description, status) VALUES
('group-001', '华东区', '华东地区服务团队', 'ACTIVE'),
('group-002', '华南区', '华南地区服务团队', 'ACTIVE'),
('group-003', '华北区', '华北地区服务团队', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample sites
INSERT INTO sites (id, name, address, level, status) VALUES
('site-001', '上海总部', '上海市浦东新区张江高科技园区', 'vip', 'ONLINE'),
('site-002', '北京分公司', '北京市朝阳区建国路', 'enterprise', 'ONLINE'),
('site-003', '深圳工厂', '深圳市南山区科技园', 'normal', 'ONLINE')
ON DUPLICATE KEY UPDATE name = name;
