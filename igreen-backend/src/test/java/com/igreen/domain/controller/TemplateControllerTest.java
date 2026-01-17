package com.igreen.domain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.CreateTemplateRequest;
import com.igreen.domain.dto.TemplateFieldRequest;
import com.igreen.domain.dto.TemplateStepRequest;
import com.igreen.domain.entity.Template;
import com.igreen.domain.entity.TemplateField;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.enums.FieldType;
import com.igreen.domain.service.TemplateService;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TemplateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TemplateService templateService;

    private Template testTemplate;
    private TemplateStep testStep;
    private TemplateField testField;

    @BeforeEach
    void setUp() {
        testTemplate = new Template();
        testTemplate.setId("template-1");
        testTemplate.setName("测试模板");
        testTemplate.setDescription("测试描述");
        testTemplate.setCreatedAt(LocalDateTime.now());
        testTemplate.setUpdatedAt(LocalDateTime.now());

        testStep = new TemplateStep();
        testStep.setId("step-1");
        testStep.setTemplateId("template-1");
        testStep.setName("步骤1");
        testStep.setDescription("步骤1描述");
        testStep.setOrder(1);
        testStep.setFields(new ArrayList<>());

        testField = new TemplateField();
        testField.setId("field-1");
        testField.setStepId("step-1");
        testField.setName("字段1");
        testField.setType(FieldType.TEXT);
        testField.setRequired(true);
        testField.setOptions(null);
    }

    @Nested
    @DisplayName("模板列表查询测试")
    class GetTemplatesTests {

        @Test
        @DisplayName("获取所有模板成功")
        @WithMockUser(roles = "ENGINEER")
        void getAllTemplates_Success() throws Exception {
            List<Template> templates = Arrays.asList(testTemplate);
            when(templateService.getAllTemplates()).thenReturn(templates);

            mockMvc.perform(get("/api/templates"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").value("template-1"))
                    .andExpect(jsonPath("$.data[0].name").value("测试模板"));

            verify(templateService).getAllTemplates();
        }

        @Test
        @DisplayName("获取所有模板返回空列表")
        @WithMockUser(roles = "ENGINEER")
        void getAllTemplates_EmptyList() throws Exception {
            when(templateService.getAllTemplates()).thenReturn(new ArrayList<>());

            mockMvc.perform(get("/api/templates"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data").isEmpty());
        }

        @Test
        @DisplayName("未登录用户获取模板应返回403")
        void getAllTemplates_Unauthorized() throws Exception {
            mockMvc.perform(get("/api/templates"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("模板详情查询测试")
    class GetTemplateDetailTests {

        @Test
        @DisplayName("获取模板详情成功")
        @WithMockUser(roles = "ENGINEER")
        void getTemplateById_Success() throws Exception {
            testTemplate.setSteps(Arrays.asList(testStep));
            when(templateService.getTemplateById("template-1")).thenReturn(testTemplate);

            mockMvc.perform(get("/api/templates/template-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("template-1"))
                    .andExpect(jsonPath("$.data.name").value("测试模板"))
                    .andExpect(jsonPath("$.data.steps").isArray());

            verify(templateService).getTemplateById("template-1");
        }

        @Test
        @DisplayName("获取不存在的模板应返回错误")
        @WithMockUser(roles = "ENGINEER")
        void getTemplateById_NotFound() throws Exception {
            when(templateService.getTemplateById("nonexistent"))
                    .thenThrow(new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

            mockMvc.perform(get("/api/templates/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.TEMPLATE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("创建模板测试")
    class CreateTemplateTests {

        @Test
        @DisplayName("管理员创建模板成功")
        @WithMockUser(roles = "ADMIN")
        void createTemplate_Success() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "新模板",
                    "新模板描述",
                    List.of(new TemplateStepRequest(
                            "步骤1",
                            "步骤1描述",
                            1,
                            List.of(new TemplateFieldRequest("字段1", FieldType.TEXT, true, null))
                    ))
            );

            Template createdTemplate = new Template();
            createdTemplate.setId("new-template-id");
            createdTemplate.setName("新模板");
            createdTemplate.setDescription("新模板描述");

            when(templateService.createTemplate(any())).thenReturn(createdTemplate);

            mockMvc.perform(post("/api/templates")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.id").value("new-template-id"))
                    .andExpect(jsonPath("$.data.name").value("新模板"));

            verify(templateService).createTemplate(any());
        }

        @Test
        @DisplayName("普通用户创建模板应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void createTemplate_Forbidden() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "新模板", "描述", null);

            mockMvc.perform(post("/api/templates")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(templateService, never()).createTemplate(any());
        }

        @Test
        @DisplayName("创建模板名称为空应验证失败")
        @WithMockUser(roles = "ADMIN")
        void createTemplate_ValidationFailed() throws Exception {
            String invalidRequest = "{\"name\": \"\", \"description\": \"test\"}";

            mockMvc.perform(post("/api/templates")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidRequest))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("创建模板名称已存在应返回错误")
        @WithMockUser(roles = "ADMIN")
        void createTemplate_NameExists() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "已存在的模板", "描述", null);

            when(templateService.createTemplate(any()))
                    .thenThrow(new BusinessException(ErrorCode.TEMPLATE_EXISTS));

            mockMvc.perform(post("/api/templates")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.TEMPLATE_EXISTS.getCode()));
        }
    }

    @Nested
    @DisplayName("更新模板测试")
    class UpdateTemplateTests {

        @Test
        @DisplayName("管理员更新模板成功")
        @WithMockUser(roles = "ADMIN")
        void updateTemplate_Success() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "更新后的模板",
                    "更新后的描述",
                    null
            );

            Template updatedTemplate = new Template();
            updatedTemplate.setId("template-1");
            updatedTemplate.setName("更新后的模板");
            updatedTemplate.setDescription("更新后的描述");

            when(templateService.updateTemplate(eq("template-1"), any())).thenReturn(updatedTemplate);

            mockMvc.perform(put("/api/templates/template-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.name").value("更新后的模板"));

            verify(templateService).updateTemplate(eq("template-1"), any());
        }

        @Test
        @DisplayName("普通用户更新模板应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void updateTemplate_Forbidden() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "更新后的模板", "描述", null);

            mockMvc.perform(put("/api/templates/template-1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(templateService, never()).updateTemplate(any(), any());
        }

        @Test
        @DisplayName("更新不存在的模板应返回错误")
        @WithMockUser(roles = "ADMIN")
        void updateTemplate_NotFound() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "更新后的模板", "描述", null);

            when(templateService.updateTemplate(eq("nonexistent"), any()))
                    .thenThrow(new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

            mockMvc.perform(put("/api/templates/nonexistent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.TEMPLATE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("删除模板测试")
    class DeleteTemplateTests {

        @Test
        @DisplayName("管理员删除模板成功")
        @WithMockUser(roles = "ADMIN")
        void deleteTemplate_Success() throws Exception {
            doNothing().when(templateService).deleteTemplate("template-1");

            mockMvc.perform(delete("/api/templates/template-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));

            verify(templateService).deleteTemplate("template-1");
        }

        @Test
        @DisplayName("普通用户删除模板应被拒绝")
        @WithMockUser(roles = "ENGINEER")
        void deleteTemplate_Forbidden() throws Exception {
            mockMvc.perform(delete("/api/templates/template-1"))
                    .andExpect(status().isForbidden());

            verify(templateService, never()).deleteTemplate(any());
        }

        @Test
        @DisplayName("删除不存在的模板应返回错误")
        @WithMockUser(roles = "ADMIN")
        void deleteTemplate_NotFound() throws Exception {
            doThrow(new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND))
                    .when(templateService).deleteTemplate("nonexistent");

            mockMvc.perform(delete("/api/templates/nonexistent"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(ErrorCode.TEMPLATE_NOT_FOUND.getCode()));
        }
    }

    @Nested
    @DisplayName("Manager角色测试")
    class ManagerRoleTests {

        @Test
        @DisplayName("Manager角色不能创建模板")
        @WithMockUser(roles = "MANAGER")
        void createTemplate_Forbidden_ForManager() throws Exception {
            CreateTemplateRequest request = new CreateTemplateRequest(
                    "新模板", "描述", null);

            mockMvc.perform(post("/api/templates")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

            verify(templateService, never()).createTemplate(any());
        }
    }
}
