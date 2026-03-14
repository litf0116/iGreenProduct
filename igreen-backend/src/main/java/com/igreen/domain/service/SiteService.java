package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.context.CountryContext;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.dto.SiteCreateRequest;
import com.igreen.domain.dto.SiteStats;
import com.igreen.domain.dto.SiteUpdateRequest;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.mapper.SiteMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteService {

    private final SiteMapper siteMapper;

    @Transactional
    public Site createSite(SiteCreateRequest request) {
        String country = CountryContext.get();
        
        LambdaQueryWrapper<Site> nameWrapper = new LambdaQueryWrapper<>();
        nameWrapper.eq(Site::getName, request.name()).eq(Site::getCountry, country);
        if (siteMapper.selectCount(nameWrapper) > 0) {
            throw new BusinessException(ErrorCode.SITE_EXISTS);
        }

        if (request.code() != null && !request.code().isBlank()) {
            if (siteMapper.countByCode(request.code()) > 0) {
                throw new BusinessException(ErrorCode.SITE_EXISTS);
            }
        }

        Site site = Site.builder()
                .id(UUID.randomUUID().toString())
                .code(request.code())
                .name(request.name())
                .address(request.address())
                .level(request.level() != null ? request.level() : "normal")
                .status(request.status() != null ? request.status() : SiteStatus.ONLINE)
                .country(country)
                .build();

        siteMapper.insert(site);
        return site;
    }

    @Transactional(readOnly = true)
    public Site getSiteById(String id) {
        Site site = siteMapper.selectById(id);
        if (site == null) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }
        return site;
    }

    @Transactional(readOnly = true)
    public PageResult<Site> getAllSites(int page, int size, String keyword, String level, String status) {
        String country = CountryContext.get();
        
        if (page < 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        if (size < 1) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        if (size > 100) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        PageHelper.startPage(page, size);
        try {
            LambdaQueryWrapper<Site> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Site::getCountry, country);
            
            if (keyword != null && !keyword.isEmpty()) {
                wrapper.and(w -> w.like(Site::getName, keyword).or().like(Site::getAddress, keyword));
            }
            if (level != null && !level.isEmpty()) {
                wrapper.eq(Site::getLevel, level);
            }
            if (status != null && !status.isEmpty()) {
                try {
                    wrapper.eq(Site::getStatus, SiteStatus.valueOf(status));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status: {}", status);
                }
            }
            
            wrapper.orderByDesc(Site::getCreatedAt);
            List<Site> sites = siteMapper.selectList(wrapper);
            PageInfo<Site> pageInfo = new PageInfo<>(sites);
            return PageResult.of(pageInfo, sites);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public List<Site> getSitesByStatus(SiteStatus status) {
        String country = CountryContext.get();
        LambdaQueryWrapper<Site> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Site::getCountry, country).eq(Site::getStatus, status);
        return siteMapper.selectList(wrapper);
    }

    @Transactional(readOnly = true)
    public SiteStats getSiteStats() {
        String country = CountryContext.get();
        LambdaQueryWrapper<Site> baseWrapper = new LambdaQueryWrapper<>();
        baseWrapper.eq(Site::getCountry, country);
        
        long totalSites = siteMapper.selectCount(baseWrapper);
        
        long onlineSites = siteMapper.selectCount(
            new LambdaQueryWrapper<Site>().eq(Site::getCountry, country).eq(Site::getStatus, SiteStatus.ONLINE)
        );
        
        long offlineSites = siteMapper.selectCount(
            new LambdaQueryWrapper<Site>().eq(Site::getCountry, country).eq(Site::getStatus, SiteStatus.OFFLINE)
        );
        
        long vipSites = siteMapper.selectCount(
            new LambdaQueryWrapper<Site>().eq(Site::getCountry, country).like(Site::getLevel, "vip")
        );
        
        return new SiteStats(totalSites, onlineSites, offlineSites, vipSites);
    }

    @Transactional
    public Site updateSite(String id, SiteUpdateRequest request) {
        Site existingSite = siteMapper.selectById(id);
        if (existingSite == null) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }

        if (request.name() != null && !request.name().equals(existingSite.getName())) {
            if (siteMapper.countByName(request.name()) > 0) {
                throw new BusinessException(ErrorCode.SITE_EXISTS);
            }
            existingSite.setName(request.name());
        }
        if (request.address() != null) {
            existingSite.setAddress(request.address());
        }
        if (request.level() != null) {
            existingSite.setLevel(request.level());
        }
        if (request.status() != null) {
            existingSite.setStatus(request.status());
        }

        siteMapper.updateById(existingSite);
        return existingSite;
    }

    @Transactional
    public void deleteSite(String id) {
        if (siteMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }
        siteMapper.deleteById(id);
    }
}
