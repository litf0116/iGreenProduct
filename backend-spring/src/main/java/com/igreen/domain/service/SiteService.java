package com.igreen.domain.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
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
public class SiteService {


    private final SiteMapper siteMapper;

    @Transactional
    public Site createSite(Site site) {
        if (siteMapper.countByName(site.getName()) > 0) {
            throw new BusinessException(ErrorCode.SITE_EXISTS);
        }

        site.setId(UUID.randomUUID().toString());
        if (site.getStatus() == null) {
            site.setStatus(SiteStatus.ONLINE);
        }
        if (site.getLevel() == null) {
            site.setLevel("normal");
        }

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
    public PageResult<Site> getAllSites(int page, int size, String keyword) {
        PageHelper.startPage(page, size);
        try {
            List<Site> sites;
            if (keyword != null && !keyword.isEmpty()) {
                sites = siteMapper.selectByNameContaining(keyword);
            } else {
                sites = siteMapper.selectList(new LambdaQueryWrapper<>());
            }

            PageInfo<Site> pageInfo = new PageInfo<>(sites);
            return PageResult.of(pageInfo, sites);
        } finally {
            PageHelper.clearPage();
        }
    }

    @Transactional(readOnly = true)
    public List<Site> getSitesByStatus(SiteStatus status) {
        return siteMapper.selectByStatus(status.name());
    }

    @Transactional
    public Site updateSite(String id, Site site) {
        Site existingSite = siteMapper.selectById(id);
        if (existingSite == null) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }

        if (site.getName() != null && !site.getName().equals(existingSite.getName())) {
            if (siteMapper.countByName(site.getName()) > 0) {
                throw new BusinessException(ErrorCode.SITE_EXISTS);
            }
            existingSite.setName(site.getName());
        }
        if (site.getAddress() != null) {
            existingSite.setAddress(site.getAddress());
        }
        if (site.getLevel() != null) {
            existingSite.setLevel(site.getLevel());
        }
        if (site.getStatus() != null) {
            existingSite.setStatus(site.getStatus());
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
