package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.CreateTemplateRequest;
import com.igreen.domain.dto.TemplateFieldRequest;
import com.igreen.domain.dto.TemplateStepRequest;
import com.igreen.domain.entity.Template;
import com.igreen.domain.entity.TemplateField;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.enums.FieldType;
import com.igreen.domain.mapper.TemplateFieldMapper;
import com.igreen.domain.mapper.TemplateMapper;
import com.igreen.domain.mapper.TemplateStepMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
class TemplateServiceTest {

    @Mock
    private TemplateMapper templateMapper;

    @Mock
    private TemplateStepMapper templateStepMapper;

    @Mock
    private TemplateFieldMapper templateFieldMapper;

    @InjectMocks
    private TemplateService templateService;

    private Template testTemplate;

    @BeforeEach
    void setUp() {
        testTemplate = new Template();
        testTemplate.setId("template-1");
        testTemplate.setName("测试模板");
        testTemplate.setDescription("测试描述");
    }

    @Test
    @DisplayName("创建模板成功")
    void createTemplate_Success() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "新模板",
                "新模板描述",
                List.of(
                        new TemplateStepRequest("步骤1", "步骤1描述", 1, List.of(
                                new TemplateFieldRequest("字段1", FieldType.TEXT, true, null)
                        ))
                )
        );

        Template createdTemplate = new Template();
        createdTemplate.setId("new-template-id");
        createdTemplate.setName("新模板");
        createdTemplate.setDescription("新模板描述");

        when(templateMapper.countByName("新模板")).thenReturn(0);
        when(templateMapper.insert(any(Template.class))).thenAnswer(invocation -> {
            Template t = invocation.getArgument(0);
            t.setId("new-template-id");
            return 1;
        });
        when(templateFieldMapper.selectByStepId(anyString())).thenReturn(new ArrayList<>());
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString())).thenReturn(new ArrayList<>());
        lenient().when(templateMapper.selectById("new-template-id")).thenReturn(createdTemplate);

        Template result = templateService.createTemplate(request);

        assertNotNull(result);
        verify(templateMapper).insert(any(Template.class));
        verify(templateStepMapper).insert(any(TemplateStep.class));
        verify(templateFieldMapper).insert(any(TemplateField.class));
    }

    @Test
    @DisplayName("创建模板时名称已存在应抛出异常")
    void createTemplate_NameExists() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "已存在的模板",
                "描述",
                null
        );

        when(templateMapper.countByName("已存在的模板")).thenReturn(1);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> templateService.createTemplate(request));

        assertEquals(ErrorCode.TEMPLATE_EXISTS.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取模板详情成功")
    void getTemplateById_Success() {
        when(templateMapper.selectById("template-1")).thenReturn(testTemplate);
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc("template-1")).thenReturn(new ArrayList<>());

        Template result = templateService.getTemplateById("template-1");

        assertNotNull(result);
        assertEquals("template-1", result.getId());
        assertEquals("测试模板", result.getName());
    }

    @Test
    @DisplayName("获取不存在的模板应抛出异常")
    void getTemplateById_NotFound() {
        when(templateMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> templateService.getTemplateById("nonexistent"));

        assertEquals(ErrorCode.TEMPLATE_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取所有模板成功")
    void getAllTemplates_Success() {
        List<Template> templates = Arrays.asList(testTemplate);
        when(templateMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(templates);
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString())).thenReturn(new ArrayList<>());

        List<Template> result = templateService.getAllTemplates();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("删除模板成功")
    void deleteTemplate_Success() {
        when(templateMapper.selectById("template-1")).thenReturn(testTemplate);

        templateService.deleteTemplate("template-1");

        verify(templateFieldMapper).deleteByTemplateId("template-1");
        verify(templateStepMapper).deleteByTemplateId("template-1");
        verify(templateMapper).deleteById("template-1");
    }

    @Test
    @DisplayName("删除不存在的模板应抛出异常")
    void deleteTemplate_NotFound() {
        when(templateMapper.selectById("nonexistent")).thenReturn(null);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> templateService.deleteTemplate("nonexistent"));

        assertEquals(ErrorCode.TEMPLATE_NOT_FOUND.getCode(), exception.getCode());
    }

    @Test
    @DisplayName("获取空模板列表")
    void getAllTemplates_EmptyList() {
        when(templateMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList());

        List<Template> result = templateService.getAllTemplates();

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("获取多个模板")
    void getAllTemplates_MultipleTemplates() {
        Template template2 = new Template();
        template2.setId("template-2");
        template2.setName("模板2");

        when(templateMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(testTemplate, template2));
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString()))
                .thenReturn(new ArrayList<>());

        List<Template> result = templateService.getAllTemplates();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("创建模板时无步骤")
    void createTemplate_NoSteps() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "新模板",
                "描述",
                null
        );

        when(templateMapper.countByName("新模板")).thenReturn(0);
        when(templateMapper.insert(any(Template.class))).thenAnswer(invocation -> {
            Template t = invocation.getArgument(0);
            t.setId("new-template-id");
            return 1;
        });
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString()))
                .thenReturn(new ArrayList<>());
        lenient().when(templateMapper.selectById("new-template-id")).thenReturn(testTemplate);

        Template result = templateService.createTemplate(request);

        assertNotNull(result);
        verify(templateStepMapper, never()).insert(any(TemplateStep.class));
    }

    @Test
    @DisplayName("创建模板时无字段")
    void createTemplate_NoFields() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "新模板",
                "描述",
                List.of(new TemplateStepRequest("步骤1", "描述", 1, null))
        );

        when(templateMapper.countByName("新模板")).thenReturn(0);
        when(templateMapper.insert(any(Template.class))).thenAnswer(invocation -> {
            Template t = invocation.getArgument(0);
            t.setId("new-template-id");
            return 1;
        });
        when(templateFieldMapper.selectByStepId(anyString())).thenReturn(new ArrayList<>());
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString())).thenReturn(new ArrayList<>());
        lenient().when(templateMapper.selectById("new-template-id")).thenReturn(testTemplate);

        Template result = templateService.createTemplate(request);

        assertNotNull(result);
        verify(templateFieldMapper, never()).insert(any(TemplateField.class));
    }

    @Test
    @DisplayName("创建模板时描述为null")
    void createTemplate_NullDescription() {
        CreateTemplateRequest request = new CreateTemplateRequest(
                "新模板",
                null,
                null
        );

        when(templateMapper.countByName("新模板")).thenReturn(0);
        when(templateMapper.insert(any(Template.class))).thenAnswer(invocation -> {
            Template t = invocation.getArgument(0);
            t.setId("new-template-id");
            return 1;
        });
        when(templateStepMapper.selectByTemplateIdOrderByOrderAsc(anyString()))
                .thenReturn(new ArrayList<>());
        lenient().when(templateMapper.selectById("new-template-id")).thenReturn(testTemplate);

        Template result = templateService.createTemplate(request);

        assertNotNull(result);
    }
}
