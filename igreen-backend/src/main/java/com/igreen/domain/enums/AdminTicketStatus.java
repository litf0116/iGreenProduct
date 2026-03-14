package com.igreen.domain.enums;

public enum AdminTicketStatus {
    OPEN,           // 新建/待分配 (open, assigned)
    IN_PROGRESS,    // 进行中 (accepted, departed, arrived)
    SUBMITTED,      // 待审核 (review)
    @Deprecated
    ON_HOLD,        // 暂停 (已废弃)
    CLOSED          // 已关闭 (completed, cancelled)
}
