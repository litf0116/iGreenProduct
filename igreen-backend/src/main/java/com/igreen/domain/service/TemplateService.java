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
import com.igreen.domain.mapper.TemplateFieldMapper;
import com.igreen.domain.mapper.TemplateMapper;
import com.igreen.domain.mapper.TemplateStepMapper;
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
    private final TemplateStepMapper templateStepMapper;
    private final TemplateFieldMapper templateFieldMapper;

    @Transactional
    public Template createTemplate(CreateTemplateRequest request) {
        if (templateMapper.countByName(request.name()) > 0) {
            throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
        }

        Template template = new Template();
        template.setId(UUID.randomUUID().toString());
        template.setName(request.name());
        template.setDescription(request.description());
        templateMapper.insert(template);

        createStepsAndFields(template.getId(), request.steps());

        return getTemplateById(template.getId());
    }

    @Transactional
    public Template updateTemplate(String id, CreateTemplateRequest request) {
        Template existing = templateMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (request.name() != null && !request.name().equals(existing.getName())) {
            if (templateMapper.countByName(request.name()) > 0) {
                throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
            }
            existing.setName(request.name());
        }
        if (request.description() != null) {
            existing.setDescription(request.description());
        }

        templateMapper.updateById(existing);

        if (request.steps() != null) {
            templateFieldMapper.deleteByTemplateId(id);
            templateStepMapper.delete(new LambdaQueryWrapper<TemplateStep>().eq(TemplateStep::getTemplateId, id));
            createStepsAndFields(id, request.steps());
        }

        return getTemplateById(id);
    }

    private void createStepsAndFields(String templateId, List<TemplateStepRequest> steps) {
        if (steps == null || steps.isEmpty()) {
            return;
        }

        int order = 1;
        for (TemplateStepRequest stepRequest : steps) {
            TemplateStep step = new TemplateStep();
            step.setId(UUID.randomUUID().toString());
            step.setTemplateId(templateId);
            step.setName(stepRequest.name());
            step.setDescription(stepRequest.description());
            step.setSortOrder(stepRequest.order() != null ? stepRequest.order() : order++);
            templateStepMapper.insert(step);

            createFields(step.getId(), stepRequest.fields());
        }
    }

    private void createFields(String stepId, List<TemplateFieldRequest> fields) {
        if (fields == null || fields.isEmpty()) {
            return;
        }

        for (TemplateFieldRequest fieldRequest : fields) {
            TemplateField field = new TemplateField();
            field.setId(UUID.randomUUID().toString());
            field.setStepId(stepId);
            field.setName(fieldRequest.name());
            field.setType(fieldRequest.type());
            field.setRequired(fieldRequest.required());
            field.setOptions(fieldRequest.options());
            templateFieldMapper.insert(field);
        }
    }

    @Transactional(readOnly = true)
    public Template getTemplateById(String id) {
        Template template = templateMapper.selectById(id);
        if (template == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        LambdaQueryWrapper<TemplateStep> stepWrapper = new LambdaQueryWrapper<>();
        stepWrapper.eq(TemplateStep::getTemplateId, id);
        stepWrapper.orderByAsc(TemplateStep::getSortOrder);
        List<TemplateStep> steps = templateStepMapper.selectList(stepWrapper);
        for (TemplateStep step : steps) {
            List<TemplateField> fields = templateFieldMapper.selectByStepId(step.getId());
            step.setFields(fields);
        }
        template.setSteps(steps);

        return template;
    }

    @Transactional(readOnly = true)
    public List<Template> getAllTemplates() {
        List<Template> templates = templateMapper.selectList(new LambdaQueryWrapper<>());
        for (Template template : templates) {
            LambdaQueryWrapper<TemplateStep> stepWrapper = new LambdaQueryWrapper<>();
            stepWrapper.eq(TemplateStep::getTemplateId, template.getId());
            stepWrapper.orderByAsc(TemplateStep::getSortOrder);
            List<TemplateStep> steps = templateStepMapper.selectList(stepWrapper);
            for (TemplateStep step : steps) {
                List<TemplateField> fields = templateFieldMapper.selectByStepId(step.getId());
                step.setFields(fields);
            }
            template.setSteps(steps);
        }
        return templates;
    }

    @Transactional
    public void deleteTemplate(String id) {
        if (templateMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateFieldMapper.deleteByTemplateId(id);
        templateStepMapper.delete(new LambdaQueryWrapper<TemplateStep>().eq(TemplateStep::getTemplateId, id));
        templateMapper.deleteById(id);
    }
}
