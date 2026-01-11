package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
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
public class TemplateService {


    private final TemplateMapper templateMapper;
    private final TemplateStepMapper templateStepMapper;
    private final TemplateFieldMapper templateFieldMapper;

    @Transactional
    public Template createTemplate(Template template) {
        if (templateMapper.countByName(template.getName()) > 0) {
            throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
        }

        template.setId(UUID.randomUUID().toString());
        templateMapper.insert(template);
        return template;
    }

    @Transactional
    public Template updateTemplate(String id, Template template) {
        Template existing = templateMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (template.getName() != null && !template.getName().equals(existing.getName())) {
            if (templateMapper.countByName(template.getName()) > 0) {
                throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
            }
            existing.setName(template.getName());
        }
        if (template.getDescription() != null) {
            existing.setDescription(template.getDescription());
        }

        templateMapper.updateById(existing);
        return existing;
    }

    @Transactional(readOnly = true)
    public Template getTemplateById(String id) {
        Template template = templateMapper.selectById(id);
        if (template == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        List<TemplateStep> steps = templateStepMapper.selectByTemplateIdOrderByOrderAsc(id);
        for (TemplateStep step : steps) {
            List<TemplateField> fields = templateFieldMapper.selectByStepId(step.getId());
            step.setFields(fields);
        }
        template.setSteps(steps);

        return template;
    }

    @Transactional(readOnly = true)
    public List<Template> getAllTemplates() {
        return templateMapper.selectList(new LambdaQueryWrapper<>());
    }

    @Transactional
    public void deleteTemplate(String id) {
        if (templateMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateMapper.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TemplateStep> getTemplateSteps(String templateId) {
        return templateStepMapper.selectByTemplateIdOrderByOrderAsc(templateId);
    }

    @Transactional
    public TemplateStep createStep(String templateId, TemplateStep step) {
        if (templateMapper.selectById(templateId) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        step.setId(UUID.randomUUID().toString());
        step.setTemplateId(templateId);
        step.setFields(new ArrayList<>());
        templateStepMapper.insert(step);
        return step;
    }

    @Transactional
    public TemplateStep updateStep(String stepId, TemplateStep step) {
        TemplateStep existing = templateStepMapper.selectById(stepId);
        if (existing == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (step.getName() != null) {
            existing.setName(step.getName());
        }
        if (step.getDescription() != null) {
            existing.setDescription(step.getDescription());
        }
        if (step.getOrder() != null) {
            existing.setOrder(step.getOrder());
        }

        templateStepMapper.updateById(existing);
        return existing;
    }

    @Transactional
    public void deleteStep(String stepId) {
        if (templateStepMapper.selectById(stepId) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateStepMapper.deleteById(stepId);
    }

    @Transactional(readOnly = true)
    public List<TemplateField> getStepFields(String stepId) {
        return templateFieldMapper.selectByStepId(stepId);
    }

    @Transactional
    public TemplateField createField(String stepId, TemplateField field) {
        if (templateStepMapper.selectById(stepId) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        field.setId(UUID.randomUUID().toString());
        field.setStepId(stepId);
        templateFieldMapper.insert(field);
        return field;
    }

    @Transactional
    public TemplateField updateField(String fieldId, TemplateField field) {
        TemplateField existing = templateFieldMapper.selectById(fieldId);
        if (existing == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        if (field.getName() != null) {
            existing.setName(field.getName());
        }
        if (field.getType() != null) {
            existing.setType(field.getType());
        }
        if (field.getRequired() != null) {
            existing.setRequired(field.getRequired());
        }
        if (field.getOptions() != null) {
            existing.setOptions(field.getOptions());
        }

        templateFieldMapper.updateById(existing);
        return existing;
    }

    @Transactional
    public void deleteField(String fieldId) {
        if (templateFieldMapper.selectById(fieldId) == null) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateFieldMapper.deleteById(fieldId);
    }
}
