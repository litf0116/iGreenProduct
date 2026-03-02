-- Add template_data column to tickets table
ALTER TABLE tickets ADD COLUMN template_data JSON COMMENT '模板数据（包含字段值）' AFTER step_data;
