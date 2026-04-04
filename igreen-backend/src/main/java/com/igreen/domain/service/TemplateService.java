package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.context.CountryContext;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.CreateTemplateRequest;
import com.igreen.domain.dto.TemplateFieldRequest;
import com.igreen.domain.dto.TemplateStepRequest;
import com.igreen.domain.entity.Template;
import com.igreen.domain.entity.TemplateField;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.enums.TicketType;
import com.igreen.domain.mapper.TemplateMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final TemplateMapper templateMapper;

    /**
     * 系统内置固定模板 ID，禁止删除
     * 这些模板是工单系统的核心配置，删除会导致对应类型的工单无法正常工作
     */
    private static final Set<String> PROTECTED_TEMPLATE_IDS = Set.of(
        "8d1ad5d0-d837-4adb-aa84-23e318d36611", // Corrective Maintenance
        "c27f7ceb-b9c6-466a-9e18-12d8e827a6f8", // Planned Maintenance
        "292c7267-98fd-42ff-9a4e-a76ffa552618", // Preventive Maintenance
        "f982267a-d9e0-4462-8f93-2f8ad16b4c1c"  // Problem Management
    );

    @Transactional
    public Template createTemplate(CreateTemplateRequest request) {
        String country = CountryContext.get();
        
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getName, request.getName()).eq(Template::getCountry, country);
        if (templateMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
        }

        Template template = new Template();
        template.setId(UUID.randomUUID().toString());
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setType(request.getType() != null ? request.getType() : TicketType.PLANNED);
        template.setCountry(country);

        List<TemplateStep> steps = convertStepsRequest(request.getSteps());
        template.setSteps(steps);

        templateMapper.insert(template);

        return getTemplateById(template.getId());
    }

    @Transactional
    public Template updateTemplate(String id, CreateTemplateRequest request) {
        String country = CountryContext.get();
        Template existing = templateMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (request.getName() != null && !request.getName().equals(existing.getName())) {
            LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Template::getName, request.getName()).eq(Template::getCountry, country);
            if (templateMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
            }
            existing.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        
        if (request.getType() != null) {
            existing.setType(request.getType());
        }

        if (request.getSteps() != null) {
            List<TemplateStep> steps = convertStepsRequest(request.getSteps());
            existing.setSteps(steps);
        }

        templateMapper.updateById(existing);

        return getTemplateById(id);
    }

    private List<TemplateStep> convertStepsRequest(List<TemplateStepRequest> stepsRequests) {
        if (stepsRequests == null || stepsRequests.isEmpty()) {
            return new ArrayList<>();
        }

        List<TemplateStep> steps = new ArrayList<>();
        int order = 1;

        for (TemplateStepRequest stepRequest : stepsRequests) {
            TemplateStep step = TemplateStep.builder().name(stepRequest.getName()).description(stepRequest.getDescription()).sortOrder(stepRequest.getOrder() != null ? stepRequest.getOrder() : order++).fields(convertFieldsRequest(stepRequest.getFields())).build();

            steps.add(step);
        }

        return steps;
    }

    private List<TemplateField> convertFieldsRequest(List<TemplateFieldRequest> fieldsRequests) {
        if (fieldsRequests == null || fieldsRequests.isEmpty()) {
            return new ArrayList<>();
        }

        List<TemplateField> fields = new ArrayList<>();

        for (TemplateFieldRequest fieldRequest : fieldsRequests) {
            TemplateField field = TemplateField.builder()
                .name(fieldRequest.getName())
                .type(fieldRequest.getType())
                .required(fieldRequest.getRequired())
                .build();

            fields.add(field);
        }

        return fields;
    }

    // 保留这些方法是为了向后兼容，但不再使用

    @Transactional(readOnly = true)
    public Template getTemplateById(String id) {
        Template template = templateMapper.selectById(id);
        if (template == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        // 从 stepConfig 反序列化 steps，getSteps() 方法会自动处理
        template.getSteps();

        return template;
    }

    @Transactional(readOnly = true)
    public List<Template> getAllTemplates() {
        String country = CountryContext.get();
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getCountry, country);
        
        List<Template> templates = templateMapper.selectList(wrapper);

        for (Template template : templates) {
            template.getSteps();
        }

        return templates;
    }

    @Transactional
    public void deleteTemplate(String id) {
        if (templateMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (PROTECTED_TEMPLATE_IDS.contains(id)) {
            throw new BusinessException("系统内置模板禁止删除", "TEMPLATE_PROTECTED");
        }

        templateMapper.deleteById(id);
    }

}
