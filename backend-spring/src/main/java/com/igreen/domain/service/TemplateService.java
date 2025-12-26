package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.entity.Template;
import com.igreen.domain.entity.TemplateField;
import com.igreen.domain.entity.TemplateStep;
import com.igreen.domain.repository.TemplateFieldRepository;
import com.igreen.domain.repository.TemplateRepository;
import com.igreen.domain.repository.TemplateStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateStepRepository templateStepRepository;
    private final TemplateFieldRepository templateFieldRepository;

    @Transactional
    public Template createTemplate(Template template) {
        if (templateRepository.existsByName(template.getName())) {
            throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
        }

        template.setId(UUID.randomUUID().toString());
        return templateRepository.save(template);
    }

    @Transactional
    public Template updateTemplate(String id, Template template) {
        Template existing = templateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

        if (template.getName() != null && !template.getName().equals(existing.getName())) {
            if (templateRepository.existsByName(template.getName())) {
                throw new BusinessException(ErrorCode.TEMPLATE_EXISTS);
            }
            existing.setName(template.getName());
        }
        if (template.getDescription() != null) {
            existing.setDescription(template.getDescription());
        }

        return templateRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Template getTemplateById(String id) {
        return templateRepository.findByIdWithStepsAndFields(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Transactional
    public void deleteTemplate(String id) {
        if (!templateRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TemplateStep> getTemplateSteps(String templateId) {
        return templateStepRepository.findByTemplateIdOrderByOrderAsc(templateId);
    }

    @Transactional
    public TemplateStep createStep(String templateId, TemplateStep step) {
        if (!templateRepository.existsById(templateId)) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        step.setId(UUID.randomUUID().toString());
        step.setTemplateId(templateId);
        return templateStepRepository.save(step);
    }

    @Transactional
    public TemplateStep updateStep(String stepId, TemplateStep step) {
        TemplateStep existing = templateStepRepository.findById(stepId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

        if (step.getName() != null) {
            existing.setName(step.getName());
        }
        if (step.getDescription() != null) {
            existing.setDescription(step.getDescription());
        }
        if (step.getOrder() != null) {
            existing.setOrder(step.getOrder());
        }

        return templateStepRepository.save(existing);
    }

    @Transactional
    public void deleteStep(String stepId) {
        if (!templateStepRepository.existsById(stepId)) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateStepRepository.deleteById(stepId);
    }

    @Transactional(readOnly = true)
    public List<TemplateField> getStepFields(String stepId) {
        return templateFieldRepository.findByStepId(stepId);
    }

    @Transactional
    public TemplateField createField(String stepId, TemplateField field) {
        if (!templateStepRepository.existsById(stepId)) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }

        field.setId(UUID.randomUUID().toString());
        field.setStepId(stepId);
        return templateFieldRepository.save(field);
    }

    @Transactional
    public TemplateField updateField(String fieldId, TemplateField field) {
        TemplateField existing = templateFieldRepository.findById(fieldId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

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

        return templateFieldRepository.save(existing);
    }

    @Transactional
    public void deleteField(String fieldId) {
        if (!templateFieldRepository.existsById(fieldId)) {
            throw new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND);
        }
        templateFieldRepository.deleteById(fieldId);
    }
}
