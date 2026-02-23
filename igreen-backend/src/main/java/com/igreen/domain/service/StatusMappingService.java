package com.igreen.domain.service;

import com.igreen.domain.enums.AdminTicketStatus;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 工单状态映射服务
 * 用于管理端与工程师端状态之间的转换
 */
@Service
public class StatusMappingService {

    /**
     * 将管理端状态转换为工程师端状态列表
     * 用于数据库查询
     */
    public List<String> toEngineerStatuses(AdminTicketStatus adminStatus) {
        return switch (adminStatus) {
            case OPEN -> List.of("OPEN");
            case ACCEPTED -> List.of("ASSIGNED");
            case IN_PROCESS -> List.of("ASSIGNED", "ACCEPTED", "DEPARTED", "ARRIVED");
            case SUBMITTED -> List.of("REVIEW");
            case ON_HOLD -> List.of("ON_HOLD");
            case CLOSED -> List.of("COMPLETED", "CANCELLED");
        };
    }

    /**
     * 将工程师端状态转换为我管理端状态
     * 用于前端展示
     */
    public AdminTicketStatus toAdminStatus(String engineerStatus) {
        return switch (engineerStatus) {
            case "OPEN" -> AdminTicketStatus.OPEN;
            case "ASSIGNED" -> AdminTicketStatus.ACCEPTED;
            case "ACCEPTED", "DEPARTED", "ARRIVED" -> AdminTicketStatus.IN_PROCESS;
            case "REVIEW" -> AdminTicketStatus.SUBMITTED;
            case "ON_HOLD" -> AdminTicketStatus.ON_HOLD;
            case "COMPLETED", "CANCELLED" -> AdminTicketStatus.CLOSED;
            default -> throw new IllegalArgumentException("Unknown engineer status: " + engineerStatus);
        };
    }
}
