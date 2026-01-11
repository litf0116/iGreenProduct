package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.domain.dto.*;
import com.igreen.domain.entity.*;
import com.igreen.domain.enums.Priority;
import com.igreen.domain.mapper.ProblemTypeMapper;
import com.igreen.domain.mapper.SLAConfigMapper;
import com.igreen.domain.mapper.SiteLevelConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfigService {


    private final SLAConfigMapper slaConfigMapper;
    private final ProblemTypeMapper problemTypeMapper;
    private final SiteLevelConfigMapper siteLevelConfigMapper;

    @Transactional(readOnly = true)
    public List<SLAConfigResponse> getAllSLAConfigs() {
        return slaConfigMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(this::toSLAConfigResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SLAConfigResponse getSLAConfigByPriority(Priority priority) {
        SLAConfig config = slaConfigMapper.selectByPriority(priority.name())
                .orElseThrow(() -> new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND));
        return toSLAConfigResponse(config);
    }

    @Transactional
    public SLAConfigResponse createOrUpdateSLAConfig(SLAConfigRequest request) {
        SLAConfig config = slaConfigMapper.selectByPriority(request.priority().name())
                .orElseGet(() -> {
                    SLAConfig newConfig = new SLAConfig();
                    newConfig.setId(UUID.randomUUID().toString());
                    newConfig.setPriority(request.priority());
                    return newConfig;
                });

        config.setResponseTimeMinutes(request.responseTimeMinutes());
        config.setCompletionTimeHours(request.completionTimeHours());

        if (config.getId() == null) {
            config.setId(UUID.randomUUID().toString());
        }
        slaConfigMapper.insert(config);
        return toSLAConfigResponse(config);
    }

    @Transactional(readOnly = true)
    public List<ProblemTypeResponse> getAllProblemTypes() {
        return problemTypeMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(this::toProblemTypeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProblemTypeResponse createProblemType(ProblemTypeRequest request) {
        if (problemTypeMapper.selectByName(request.name()).isPresent()) {
            throw new BusinessException(ErrorCode.PROBLEM_TYPE_EXISTS);
        }

        ProblemType problemType = ProblemType.builder()
                .id(UUID.randomUUID().toString())
                .name(request.name())
                .description(request.description())
                .build();

        problemTypeMapper.insert(problemType);
        return toProblemTypeResponse(problemType);
    }

    @Transactional
    public ProblemTypeResponse updateProblemType(String id, ProblemTypeUpdateRequest request) {
        ProblemType problemType = problemTypeMapper.selectById(id);
        if (problemType == null) {
            throw new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND);
        }

        if (request.name() != null) {
            if (problemTypeMapper.countByNameAndIdNot(request.name(), id) > 0) {
                throw new BusinessException(ErrorCode.PROBLEM_TYPE_EXISTS);
            }
            problemType.setName(request.name());
        }

        if (request.description() != null) {
            problemType.setDescription(request.description());
        }

        problemTypeMapper.updateById(problemType);
        return toProblemTypeResponse(problemType);
    }

    @Transactional
    public void deleteProblemType(String id) {
        if (problemTypeMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.PROBLEM_TYPE_NOT_FOUND);
        }
        problemTypeMapper.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SiteLevelConfigResponse> getAllSiteLevelConfigs() {
        return siteLevelConfigMapper.selectList(new LambdaQueryWrapper<>()).stream()
                .map(this::toSiteLevelConfigResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SiteLevelConfigResponse createSiteLevelConfig(SiteLevelConfigRequest request) {
        if (siteLevelConfigMapper.countByLevelName(request.levelName()) > 0) {
            throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_EXISTS);
        }

        SiteLevelConfig config = SiteLevelConfig.builder()
                .id(UUID.randomUUID().toString())
                .levelName(request.levelName())
                .description(request.description())
                .maxConcurrentTickets(request.maxConcurrentTickets())
                .escalationTimeHours(request.escalationTimeHours())
                .build();

        siteLevelConfigMapper.insert(config);
        return toSiteLevelConfigResponse(config);
    }

    @Transactional
    public SiteLevelConfigResponse updateSiteLevelConfig(String id, SiteLevelConfigUpdateRequest request) {
        SiteLevelConfig config = siteLevelConfigMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND);
        }

        if (request.levelName() != null) {
            if (siteLevelConfigMapper.countByLevelNameAndIdNot(request.levelName(), id) > 0) {
                throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_EXISTS);
            }
            config.setLevelName(request.levelName());
        }

        if (request.description() != null) {
            config.setDescription(request.description());
        }

        if (request.maxConcurrentTickets() != null) {
            config.setMaxConcurrentTickets(request.maxConcurrentTickets());
        }

        if (request.escalationTimeHours() != null) {
            config.setEscalationTimeHours(request.escalationTimeHours());
        }

        siteLevelConfigMapper.updateById(config);
        return toSiteLevelConfigResponse(config);
    }

    @Transactional
    public void deleteSiteLevelConfig(String id) {
        if (siteLevelConfigMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.SITE_LEVEL_CONFIG_NOT_FOUND);
        }
        siteLevelConfigMapper.deleteById(id);
    }

    private SLAConfigResponse toSLAConfigResponse(SLAConfig config) {
        return new SLAConfigResponse(
                config.getId(),
                config.getPriority(),
                config.getResponseTimeMinutes(),
                config.getCompletionTimeHours()
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
                config.getLevelName(),
                config.getDescription(),
                config.getMaxConcurrentTickets(),
                config.getEscalationTimeHours()
        );
    }
}
