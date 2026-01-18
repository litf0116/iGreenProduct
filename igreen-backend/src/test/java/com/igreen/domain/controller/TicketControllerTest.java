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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        testTicketResponse = createTestTicketResponse("OPEN");
        when(jwtUtils.extractUserId(anyString())).thenReturn("user-1");
    }

    private TicketResponse createTestTicketResponse(String status) {
        return createTestTicketResponse(status, false, null, null, null, null);
    }

    private TicketResponse createTestTicketResponse(
            String status,
            Boolean accepted,
            String departureAt,
            String arrivalAt
    ) {
        return createTestTicketResponse(status, accepted, departureAt, arrivalAt, null, null);
    }

    private TicketResponse createTestTicketResponse(
            String status,
            Boolean accepted,
            String departureAt,
            String arrivalAt,
            String acceptedAt,
            String completionPhoto
    ) {
        return new TicketResponse(
                "ticket-1",           // id
                "测试工单",            // title
                "测试描述",            // description
                "CORRECTIVE",         // type
                status,               // status
                "P2",                 // priority
                "site-1",             // site
                "template-1",         // templateId
                "模板名称",            // templateName
                "engineer-1",         // assignedTo
                "工程师",              // assignedToName
                "creator-1",          // createdBy
                "创建者",              // createdByName
                LocalDateTime.now().toString(),  // createdAt
                LocalDateTime.now().toString(),  // updatedAt
                LocalDateTime.now().plusDays(7).toString(),  // dueDate
                Collections.<String>emptyList(),         // completedSteps
                null,                           // stepData
                accepted,                      // accepted
                acceptedAt,                    // acceptedAt
                departureAt,                   // departureAt
                null,                           // departurePhoto
                arrivalAt,                     // arrivalAt
                null,                           // arrivalPhoto
                completionPhoto,               // completionPhoto
                null,                           // cause
                null,                           // solution
                Collections.<TicketCommentResponse>emptyList(), // comments
                null,                           // relatedTicketIds
                null                            // problemType
        );
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

        @Test
        @DisplayName("获取工单列表按时间筛选")
        @WithMockUser(roles = "ENGINEER")
        void getTickets_FilterByCreatedAfter() throws Exception {
            PageResult<TicketResponse> pageResult = PageResult.of(List.of(testTicketResponse), 1, 0, 10);
            LocalDateTime createdAfter = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
            when(ticketService.getTickets(eq(0), eq(10), any(), any(), any(), any(), any(), eq(createdAfter))).thenReturn(pageResult);

            mockMvc.perform(get("/api/tickets")
                            .param("page", "0")
                            .param("size", "10")
                            .param("createdAfter", "2025-01-01 00:00:00"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray());
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

            TicketResponse updatedResponse = createTestTicketResponse("OPEN");

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

            TicketResponse acceptedResponse = createTestTicketResponse("ASSIGNED", true, null, null);

            when(ticketService.acceptTicket(eq("ticket-1"), any(), anyString())).thenReturn(acceptedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/accept")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                    .andExpect(jsonPath("$.data.accepted").value(true));
        }
    }

    @Nested
    @DisplayName("拒绝工单测试")
    class DeclineTicketTests {

        @Test
        @DisplayName("工程师拒绝工单成功")
        @WithMockUser(roles = "ENGINEER")
        void declineTicket_Success() throws Exception {
            TicketDeclineRequest request = new TicketDeclineRequest("拒绝原因：时间冲突");

            TicketResponse declinedResponse = createTestTicketResponse("OPEN");

            when(ticketService.declineTicket(eq("ticket-1"), any(), anyString())).thenReturn(declinedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/decline")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("OPEN"));
        }

        @Test
        @DisplayName("拒绝原因不能为空")
        @WithMockUser(roles = "ENGINEER")
        void declineTicket_EmptyReason_ShouldFail() throws Exception {
            TicketDeclineRequest request = new TicketDeclineRequest("");

            mockMvc.perform(post("/api/tickets/ticket-1/decline")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("取消工单测试")
    class CancelTicketTests {

        @Test
        @DisplayName("管理员取消工单成功")
        @WithMockUser(roles = "ADMIN")
        void cancelTicket_Success() throws Exception {
            TicketCancelRequest request = new TicketCancelRequest("工单取消原因");

            TicketResponse cancelledResponse = createTestTicketResponse("CANCELLED");

            when(ticketService.cancelTicket(eq("ticket-1"), any(), anyString())).thenReturn(cancelledResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/cancel")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("CANCELLED"));
        }

        @Test
        @DisplayName("工程师不能取消工单")
        @WithMockUser(roles = "ENGINEER")
        void cancelTicket_Forbidden() throws Exception {
            TicketCancelRequest request = new TicketCancelRequest("取消原因");

            mockMvc.perform(post("/api/tickets/ticket-1/cancel")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("工单出发测试")
    class DepartTicketTests {

        @Test
        @DisplayName("工程师出发记录成功")
        @WithMockUser(roles = "ENGINEER")
        void departTicket_Success() throws Exception {
            String departurePhoto = "departure_photo_url.jpg";

            TicketResponse departedResponse = createTestTicketResponse(
                    "IN_PROGRESS", false, LocalDateTime.now().toString(), null);

            when(ticketService.departTicket(anyString(), anyString(), anyString())).thenReturn(departedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/depart")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(departurePhoto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                    .andExpect(jsonPath("$.data.departureAt").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("工单到达测试")
    class ArriveTicketTests {

        @Test
        @DisplayName("工程师到达现场记录成功")
        @WithMockUser(roles = "ENGINEER")
        void arriveTicket_Success() throws Exception {
            String arrivalPhoto = "arrival_photo_url.jpg";

            TicketResponse arrivedResponse = createTestTicketResponse(
                    "IN_PROGRESS", false, null, LocalDateTime.now().toString());

            when(ticketService.arriveTicket(anyString(), anyString(), anyString())).thenReturn(arrivedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/arrive")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(arrivalPhoto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.arrivalAt").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("提交工单测试")
    class SubmitTicketTests {

        @Test
        @DisplayName("工程师提交工单完成成功")
        @WithMockUser(roles = "ENGINEER")
        void submitTicket_Success() throws Exception {
            Map<String, Object> stepDataMap = new HashMap<>();
            stepDataMap.put("resolution", "维修完成");
            stepDataMap.put("solution", "更换了损坏的零件");
            StepData stepData = new StepData(stepDataMap);

            TicketResponse submittedResponse = createTestTicketResponse("PENDING_REVIEW");

            when(ticketService.submitTicket(eq("ticket-1"), eq(stepData), anyString())).thenReturn(submittedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/submit")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(stepData)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"));
        }
    }

    @Nested
    @DisplayName("审核工单测试")
    class ReviewTicketTests {

        @Test
        @DisplayName("主管审核通过工单")
        @WithMockUser(roles = "MANAGER")
        void reviewTicket_Approved() throws Exception {
            String cause = "验收通过，质量良好";

            TicketResponse approvedResponse = createTestTicketResponse("COMPLETED");

            when(ticketService.reviewTicket(anyString(), anyString(), anyString())).thenReturn(approvedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/review")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(cause)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("COMPLETED"));
        }

        @Test
        @DisplayName("工程师不能审核工单")
        @WithMockUser(roles = "ENGINEER")
        void reviewTicket_Forbidden() throws Exception {
            String cause = "验收通过";

            mockMvc.perform(post("/api/tickets/ticket-1/review")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(cause)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("完成工单测试")
    class CompleteTicketTests {

        @Test
        @DisplayName("管理员最终完成工单")
        @WithMockUser(roles = "ADMIN")
        void completeTicket_Success() throws Exception {
            String completionPhoto = "completion_photo_url.jpg";

            TicketResponse completedResponse = createTestTicketResponse("CLOSED");

            when(ticketService.completeTicket(anyString(), anyString(), anyString())).thenReturn(completedResponse);

            mockMvc.perform(post("/api/tickets/ticket-1/complete")
                            .header("Authorization", "Bearer test-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(completionPhoto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.status").value("CLOSED"));
        }
    }

    @Nested
    @DisplayName("我的工单测试")
    class MyTicketsTests {

        @Test
        @DisplayName("获取我的工单成功")
        @WithMockUser(roles = "ENGINEER")
        void getMyTickets_Success() throws Exception {
            PageResult<TicketResponse> pageResult = PageResult.of(List.of(testTicketResponse), 1, 0, 10);
            when(ticketService.getMyTickets(eq(0), eq(10), isNull(), anyString())).thenReturn(pageResult);

            mockMvc.perform(get("/api/tickets/my")
                            .header("Authorization", "Bearer test-token")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records[0].id").value("ticket-1"));
        }

        @Test
        @DisplayName("未登录获取我的工单应失败")
        void getMyTickets_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/tickets/my"))
                    .andExpect(status().isForbidden());
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
    @DisplayName("已完成工单测试")
    class CompletedTicketsTests {

        @Test
        @DisplayName("获取已完成工单成功")
        @WithMockUser(roles = "MANAGER")
        void getCompletedTickets_Success() throws Exception {
            TicketResponse completedTicket = createTestTicketResponse("CLOSED");

            PageResult<TicketResponse> pageResult = PageResult.of(List.of(completedTicket), 1, 0, 10);
            when(ticketService.getCompletedTickets(eq(0), eq(10))).thenReturn(pageResult);

            mockMvc.perform(get("/api/tickets/completed")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.records").isArray())
                    .andExpect(jsonPath("$.data.records[0].status").value("CLOSED"));
        }
    }

    @Nested
    @DisplayName("工单统计测试")
    class StatsTests {

        @Test
        @DisplayName("获取工单统计成功")
        @WithMockUser(roles = "MANAGER")
        void getStats_Success() throws Exception {
            // TicketStatsResponse fields: total, open, inProgress, submitted, completed, onHold
            TicketStatsResponse stats = new TicketStatsResponse(10, 5, 3, 2, 1, 0);
            when(ticketService.getTicketStats(any())).thenReturn(stats);

            mockMvc.perform(get("/api/tickets/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.total").value(10))
                    .andExpect(jsonPath("$.data.open").value(5))
                    .andExpect(jsonPath("$.data.inProgress").value(3))
                    .andExpect(jsonPath("$.data.submitted").value(2))
                    .andExpect(jsonPath("$.data.completed").value(1));
        }
    }
}
