package com.igreen.domain.repository;

import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<Site, String> {

    Optional<Site> findByName(String name);

    boolean existsByName(String name);

    List<Site> findByStatus(SiteStatus status);

    List<Site> findByLevel(String level);

    Page<Site> findAll(Pageable pageable);

    @Query("SELECT s FROM Site s WHERE s.name LIKE %:keyword%")
    Page<Site> findByNameContaining(@Param("keyword") String keyword, Pageable pageable);
}
