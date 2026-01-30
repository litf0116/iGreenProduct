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
    public SLAConfigResponse getSLAConfigById(String id) {
        SLAConfig config = slaConfigMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND);
        }
        return toSLAConfigResponse(config);
    }

    @Transactional
    public SLAConfigResponse createOrUpdateSLAConfig(SLAConfigRequest request) {
        SLAConfig config;

        if (request.id() != null) {
            config = slaConfigMapper.selectById(request.id());
            if (config == null && request.priority() != null) {
                config = slaConfigMapper.selectByPriority(request.priority().name())
                        .orElse(null);
            }
        } else if (request.priority() != null) {
            config = slaConfigMapper.selectByPriority(request.priority().name())
                    .orElse(null);
        } else {
            config = null;
        }

        if (config == null) {
            config = new SLAConfig();
            config.setId(request.id() != null ? request.id() : UUID.randomUUID().toString());
        }

        if (request.priority() != null) {
            config.setPriority(request.priority());
        }
        if (request.responseTimeMinutes() != null) {
            config.setResponseTimeMinutes(request.responseTimeMinutes());
        }
        if (request.completionTimeHours() != null) {
            config.setCompletionTimeHours(request.completionTimeHours());
        }

        if (slaConfigMapper.selectById(config.getId()) == null) {
            slaConfigMapper.insert(config);
        } else {
            slaConfigMapper.updateById(config);
        }

        return toSLAConfigResponse(config);
    }

    @Transactional
    public void deleteSLAConfig(String id) {
        if (slaConfigMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.SLA_CONFIG_NOT_FOUND);
        }
        slaConfigMapper.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PriorityResponse> getAllPriorities() {
        return List.of(
                new PriorityResponse("P1", "P1 - Critical", "Critical priority requiring immediate response"),
                new PriorityResponse("P2", "P2 - High", "High priority requiring quick response"),
                new PriorityResponse("P3", "P3 - Medium", "Medium priority with standard response time"),
                new PriorityResponse("P4", "P4 - Low", "Low priority with extended response time")
        );
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
                config.getMaxConcurrentTickets()
        );
    }
}
