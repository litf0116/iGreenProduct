package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.result.PageResult;
import com.igreen.common.utils.JwtUtils;
import com.igreen.domain.dto.*;
import com.igreen.domain.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TicketService ticketService;

    @MockBean
    private JwtUtils jwtUtils;

    private TicketResponse testTicketResponse;

    @BeforeEach
    void setUp() {
        testTicketResponse = new TicketResponse(
                "ticket-1",
                "测试工单",
                "测试描述",
                "CORRECTIVE",
                "OPEN",
                "P2",
                "site-1",
                "template-1",
                "模板名称",
                "engineer-1",
                "工程师",
                "creator-1",
                "创建者",
                LocalDateTime.now().toString(),
                LocalDateTime.now().toString(),
                LocalDateTime.now().plusDays(7).toString(),
                Collections.emptyList(),
                null,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                Collections.emptyList(),
                null,
                null
        );

        when(jwtUtils.extractUserId(anyString())).thenReturn("user-1");
    }

    @Nested
    @DisplayName("获取工单列表测试")
    class GetTicketsTests {

        @Test
        @DisplayName("获取工单列表成功")
        @WithMockUser(roles = "ENGINEER")
        void getTickets_Success() throws Exception {
            PageResult<TicketResponse> pageResult = PageResult.of(List.of(testTicketResponse), 1, 0, 10);
            when(ticketService.getTickets(eq(0), eq(10), any(), any(), any(), any(), any(), any())).thenReturn(pageResult);

            mockMvc.perform(get("/api/tickets")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records[0].id").value("ticket-1"));
        }

        @Test
        @DisplayName("获取工单列表返回空结果")
        @WithMockUser(roles = "ENGINEER")
        void getTickets_EmptyResult() throws Exception {
            PageResult<TicketResponse> emptyResult = PageResult.of(Collections.emptyList(), 0, 0, 10);
            when(ticketService.getTickets(eq(0), eq(10), any(), any(), any(), any(), any(), any())).thenReturn(emptyResult);

            mockMvc.perform(get("/api/tickets")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records").isEmpty());
        }

        @Test
        @DisplayName("获取工单列表按状态筛选")
        @WithMockUser(roles = "ENGINEER")
        void getTickets_FilterByStatus() throws Exception {
            PageResult<TicketResponse> pageResult = PageResult.of(List.of(testTicketResponse), 1, 0, 10);
            when(ticketService.getTickets(eq(0), eq(10), any(), eq("OPEN"), any(), any(), any(), any())).thenReturn(pageResult);

            mockMvc.perform(get("/api/tickets")
                            .param("page", "0")
                            .param("size", "10")
                            .param("status", "OPEN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }
    }

    @Nested
    @DisplayName("获取工单详情测试")
    class GetTicketByIdTests {

        @Test
        @DisplayName("获取工单详情成功")
        @WithMockUser(roles = "ENGINEER")
        void getTicketById_Success() throws Exception {
            when(ticketService.getTicketById("ticket-1")).thenReturn(testTicketResponse);

            mockMvc.perform(get("/api/tickets/ticket-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("ticket-1"))
                    .andExpect(jsonPath("$.data.title").value("测试工单"));
        }
    }

    @Nested
    @DisplayName("创建工单测试")
    class CreateTicketTests {

        @Test
        @DisplayName("管理员创建工单成功")
        @WithMockUser(roles = "MANAGER")
        void createTicket_Success() throws Exception {
            TicketCreateRequest request = new TicketCreateRequest(
                    "新工单",
                    "描述",
                    "CORRECTIVE",
                    "site-1",
                    "P2",
                    "template-1",
                    "engineer-1",
                    LocalDateTime.now().plusDays(7),
                    null,
                    null
            );

            when(ticketService.createTicket(any(), anyString())).thenReturn(testTicketResponse);

            mockMvc.perform(post("/api/tickets")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }

        @Test
        @DisplayName("普通用户创建工单应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createTicket_Forbidden() throws Exception {
            TicketCreateRequest request = new TicketCreateRequest(
                    "新工单", "描述", "CORRECTIVE", "site-1", "P2", "template-1",
                    "engineer-1", LocalDateTime.now().plusDays(7), null, null);

            mockMvc.perform(post("/api/tickets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("更新工单测试")
    class UpdateTicketTests {

        @Test
        @DisplayName("管理员更新工单成功")
        @WithMockUser(roles = "MANAGER")
        void updateTicket_Success() throws Exception {
            TicketUpdateRequest request = new TicketUpdateRequest(
                    "更新后的标题",
                    "更新后的描述",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );

            TicketResponse updatedResponse = new TicketResponse(
                    "ticket-1", "更新后的标题", "更新后的描述",
                    "CORRECTIVE", "OPEN", "P2", "site-1", "template-1", "模板名称",
                    "engineer-1", "工程师", "creator-1", "创建者",
                    LocalDateTime.now().toString(), LocalDateTime.now().toString(),
                    LocalDateTime.now().plusDays(7).toString(), Collections.emptyList(),
                    null, false, null, null, null, null, null, null, null,
                    null, Collections.emptyList(), null, null
            );

            when(ticketService.updateTicket(eq("ticket-1"), any())).thenReturn(updatedResponse);

            mockMvc.perform(put("/api/tickets/ticket-1")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }

        @Test
        @DisplayName("普通用户更新工单应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void updateTicket_Forbidden() throws Exception {
            TicketUpdateRequest request = new TicketUpdateRequest(
                    "更新后的标题", "更新后的描述", null, null, null, null, null,
                    null, null, null, null, null, null, null, null, null, null, null);

            mockMvc.perform(put("/api/tickets/ticket-1")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("删除工单测试")
    class DeleteTicketTests {

        @Test
        @DisplayName("管理员删除工单成功")
        @WithMockUser(roles = "ADMIN")
        void deleteTicket_Success() throws Exception {
            doNothing().when(ticketService).deleteTicket("ticket-1");

            mockMvc.perform(delete("/api/tickets/ticket-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }

        @Test
        @DisplayName("Manager删除工单应被拒绝")
        @WithMockUser(roles = "MANAGER")
        void deleteTicket_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/tickets/ticket-1"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("接受工单测试")
    class AcceptTicketTests {

        @Test
        @DisplayName("工程师接受工单成功")
        @WithMockUser(roles = "ENGINEER")
        void acceptTicket_Success() throws Exception {
            TicketAcceptRequest request = new TicketAcceptRequest("接受备注");

            TicketResponse acceptedResponse = new TicketResponse(
                    "ticket-1", "测试工单", "测试描述",
                    "CORRECTIVE", "ASSIGNED", "P2", "site-1", "template-1", "模板名称",
                    "engineer-1", "工程师", "creator-1", "创建者",
                    LocalDateTime.now().toString(), LocalDateTime.now().toString(),
                    LocalDateTime.now().plusDays(7).toString(), Collections.emptyList(),
                    null, true, LocalDateTime.now().toString(), null, null, null, null,
                    null, null, null, Collections.emptyList(), null, null
            );

            when(ticketService.acceptTicket(eq("ticket-1"), any(), anyString())).thenReturn(acceptedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/accept")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }
    }

    @Nested
    @DisplayName("待办工单测试")
    class PendingTicketsTests {

        @Test
        @DisplayName("获取待办工单成功")
        @WithMockUser(roles = "ENGINEER")
        void getPendingTickets_Success() throws Exception {
            when(ticketService.getPendingTickets()).thenReturn(List.of(testTicketResponse));

            mockMvc.perform(get("/api/tickets/pending"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray());
        }
    }

    @Nested
    @DisplayName("工单统计测试")
    class StatsTests {

        @Test
        @DisplayName("获取工单统计成功")
        @WithMockUser(roles = "MANAGER")
        void getStats_Success() throws Exception {
            TicketStatsResponse stats = new TicketStatsResponse(10, 5, 3, 2, 1, 0);
            when(ticketService.getTicketStats(any())).thenReturn(stats);

            mockMvc.perform(get("/api/tickets/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }
    }
}
