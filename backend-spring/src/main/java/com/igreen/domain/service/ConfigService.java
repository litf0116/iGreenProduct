package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.*;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConfigService {

    private final SLAConfigRepository slaConfigRepository;
    private final ProblemTypeRepository problemTypeRepository;
    private final SiteLevelConfigRepository siteLevelConfigRepository;

    @Transactional(readOnly = true)
    public List<SLAConfigResponse> getAllSLAConfigs() {
        return slaConfigRepository.findAll().stream()
                .map(this::toSLAConfigResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SLAConfigResponse getSLAConfigByPriority(Priority priority) {
        SLAConfig config = slaConfigRepository.findByPriority(priority)
                .orElseThrow(() -> new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND));
        return toSLAConfigResponse(config);
    }

    @Transactional
    public SLAConfigResponse createOrUpdateSLAConfig(SLAConfigRequest request) {
        SLAConfig config = slaConfigRepository.findByPriority(request.priority())
                .orElseGet(() -> {
                    SLAConfig newConfig = new SLAConfig();
                    newConfig.setId(UUID.randomUUID().toString());
                    newConfig.setPriority(request.priority());
                    return newConfig;
                });

        config.setResponseTime(request.responseTime());
        config.setResolutionTime(request.resolutionTime());

        config = slaConfigRepository.save(config);
        return toSLAConfigResponse(config);
    }

    @Transactional(readOnly = true)
    public List<ProblemTypeResponse> getAllProblemTypes() {
        return problemTypeRepository.findAll().stream()
                .map(this::toProblemTypeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProblemTypeResponse createProblemType(ProblemTypeRequest request) {
        if (problemTypeRepository.existsByName(request.name())) {
            throw new BusinessException(ErrorCode.PROBLEM_TYPE_EXISTS);
        }

        ProblemType problemType = ProblemType.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .description(request.description())
                .build();

        problemType = problemTypeRepository.save(problemType);
        return toProblemTypeResponse(problemType);
    }

    @Transactional
    public ProblemTypeResponse updateProblemType(String id, ProblemTypeUpdateRequest request) {
        ProblemType problemType = problemTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND));

        if (request.name() != null) {
            if (problemTypeRepository.existsByNameAndIdNot(request.name(), id)) {
                throw new BusinessException(ErrorCode.PROBLEM_TYPE_EXISTS);
            }
            problemType.setName(request.name());
        }

        if (request.description() != null) {
            problemType.setDescription(request.description());
        }

        problemType = problemTypeRepository.save(problemType);
        return toProblemTypeResponse(problemType);
    }

    @Transactional
    public void deleteProblemType(String id) {
        if (!problemTypeRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND);
        }
        problemTypeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SiteLevelConfigResponse> getAllSiteLevelConfigs() {
        return siteLevelConfigRepository.findAll().stream()
                .map(this::toSiteLevelConfigResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SiteLevelConfigResponse createSiteLevelConfig(SiteLevelConfigRequest request) {
        if (siteLevelConfigRepository.existsByName(request.name())) {
            throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_EXISTS);
        }

        SiteLevelConfig config = SiteLevelConfig.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .description(request.description())
                .slaMultiplier(request.slaMultiplier())
                .build();

        config = siteLevelConfigRepository.save(config);
        return toSiteLevelConfigResponse(config);
    }

    @Transactional
    public SiteLevelConfigResponse updateSiteLevelConfig(String id, SiteLevelConfigUpdateRequest request) {
        SiteLevelConfig config = siteLevelConfigRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND));

        if (request.name() != null) {
            if (siteLevelConfigRepository.existsByNameAndIdNot(request.name(), id)) {
                throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_EXISTS);
            }
            config.setName(request.name());
        }

        if (request.description() != null) {
            config.setDescription(request.description());
        }

        if (request.slaMultiplier() != null) {
            config.setSlaMultiplier(request.slaMultiplier());
        }

        config = siteLevelConfigRepository.save(config);
        return toSiteLevelConfigResponse(config);
    }

    @Transactional
    public void deleteSiteLevelConfig(String id) {
        if (!siteLevelConfigRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND);
        }
        siteLevelConfigRepository.deleteById(id);
    }

    private SLAConfigResponse toSLAConfigResponse(SLAConfig config) {
        return new SLAConfigResponse(
                config.getId(),
                config.getPriority(),
                config.getResponseTime(),
                config.getResolutionTime()
        );
    }

    private ProblemTypeResponse toProblemTypeResponse(ProblemType problemType) {
        return new ProblemTypeResponse(
                problemType.getId(),
                problemType.getName(),
                problemType.getDescription()
        );
    }

    private SiteLevelConfigResponse toSiteLevelConfigResponse(SiteLevelConfig config) {
        return new SiteLevelConfigResponse(
                config.getId(),
                config.getName(),
                config.getDescription(),
                config.getSlaMultiplier()
        );
    }
}
