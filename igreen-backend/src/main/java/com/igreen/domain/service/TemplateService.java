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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final TemplateMapper templateMapper;

    @Transactional
    public Template createTemplate(CreateTemplateRequest request) {
        String country = CountryContext.get();
        
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getName, request.name()).eq(Template::getCountry, country);
        if (templateMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
        }

        Template template = new Template();
        template.setId(UUID.randomUUID().toString());
        template.setName(request.name());
        template.setDescription(request.description());
        template.setType(request.type() != null ? request.type() : TicketType.PLANNED);
        template.setCountry(country);

        List<TemplateStep> steps = convertStepsRequest(request.steps());
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

        if (request.name() != null && !request.name().equals(existing.getName())) {
            LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Template::getName, request.name()).eq(Template::getCountry, country);
            if (templateMapper.selectCount(wrapper) > 0) {
                throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
            }
            existing.setName(request.name());
        }
        if (request.description() != null) {
            existing.setDescription(request.description());
        }
        
        if (request.type() != null) {
            existing.setType(request.type());
        }

        if (request.steps() != null) {
            List<TemplateStep> steps = convertStepsRequest(request.steps());
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
            TemplateStep step = TemplateStep.builder().name(stepRequest.name()).description(stepRequest.description()).sortOrder(stepRequest.order() != null ? stepRequest.order() : order++).fields(convertFieldsRequest(stepRequest.fields())).build();

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
                .name(fieldRequest.name())
                .type(fieldRequest.type())
                .required(fieldRequest.required())
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

        // 只需要删除 template 表的记录，因为 steps 和 fields 数据已经存储在 JSON 字段中
        templateMapper.deleteById(id);
    }

}
