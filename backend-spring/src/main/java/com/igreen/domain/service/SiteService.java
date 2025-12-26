package com.igreen.domain.service;

import com.igreen.common.exception.BusinessException;
import com.igreen.common.exception.ErrorCode;
import com.igreen.common.result.PageResult;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import com.igreen.domain.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteService {

    private final SiteRepository siteRepository;

    @Transactional
    public Site createSite(Site site) {
        if (siteRepository.existsByName(site.getName())) {
            throw new BusinessException(ErrorCode.SITE_EXISTS);
        }

        site.setId(UUID.randomUUID().toString());
        if (site.getStatus() == null) {
            site.setStatus(SiteStatus.ONLINE);
        }
        if (site.getLevel() == null) {
            site.setLevel("normal");
        }

        return siteRepository.save(site);
    }

    @Transactional(readOnly = true)
    public Site getSiteById(String id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SITE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public PageResult<Site> getAllSites(int page, int size, String keyword) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<Site> sitePage;
        if (keyword != null && !keyword.isEmpty()) {
            sitePage = siteRepository.findByNameContaining(keyword, pageRequest);
        } else {
            sitePage = siteRepository.findAll(pageRequest);
        }
        return PageResult.of(
                sitePage.getContent(),
                sitePage.getTotalElements(),
                page,
                size
        );
    }

    @Transactional(readOnly = true)
    public List<Site> getSitesByStatus(SiteStatus status) {
        return siteRepository.findByStatus(status);
    }

    @Transactional
    public Site updateSite(String id, Site site) {
        Site existingSite = siteRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SITE_NOT_FOUND));

        if (site.getName() != null && !site.getName().equals(existingSite.getName())) {
            if (siteRepository.existsByName(site.getName())) {
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

        return siteRepository.save(existingSite);
    }

    @Transactional
    public void deleteSite(String id) {
        if (!siteRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.SITE_NOT_FOUND);
        }
        siteRepository.deleteById(id);
    }
}
