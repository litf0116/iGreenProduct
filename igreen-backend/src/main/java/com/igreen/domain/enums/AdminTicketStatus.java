package com.igreen.domain.enums;

/**
 * 管理端工单状态枚举
 * 用于管理端Dashboard展示和筛选
 */
public enum AdminTicketStatus {
    OPEN,           // 可抢单
    ACCEPTED,       // 已分配
    IN_PROCESS,     // 进行中
    SUBMITTED,      // 待审核
    ON_HOLD,        // 暂停
    CLOSED          // 已关闭
}
