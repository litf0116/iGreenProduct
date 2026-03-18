-- Ticket Attachments Table
-- 用于存储工单创建时的附件关联

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attachments_ticket_id (ticket_id),
    INDEX idx_attachments_file_id (file_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
