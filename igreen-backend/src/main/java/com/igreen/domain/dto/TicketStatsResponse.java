package com.igreen.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatsResponse {
    private int total;
    private int open;
    private int inProgress;
    private int submitted;
    private int onHold;
    private int closed;
}
