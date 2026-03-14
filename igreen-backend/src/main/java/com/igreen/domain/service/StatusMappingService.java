package com.igreen.domain.service;

import com.igreen.domain.enums.AdminTicketStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusMappingService {

    public List<String> toEngineerStatuses(AdminTicketStatus adminStatus) {
        return switch (adminStatus) {
            case OPEN -> List.of("OPEN", "ASSIGNED");
            case IN_PROGRESS -> List.of("ACCEPTED", "DEPARTED", "ARRIVED");
            case SUBMITTED -> List.of("REVIEW");
            case ON_HOLD -> List.of();
            case CLOSED -> List.of("COMPLETED", "CANCELLED");
        };
    }

    public AdminTicketStatus toAdminStatus(String engineerStatus) {
        return switch (engineerStatus) {
            case "OPEN", "ASSIGNED" -> AdminTicketStatus.OPEN;
            case "ACCEPTED", "DEPARTED", "ARRIVED" -> AdminTicketStatus.IN_PROGRESS;
            case "REVIEW" -> AdminTicketStatus.SUBMITTED;
            case "COMPLETED", "CANCELLED" -> AdminTicketStatus.CLOSED;
            default -> AdminTicketStatus.OPEN;
        };
    }
}
