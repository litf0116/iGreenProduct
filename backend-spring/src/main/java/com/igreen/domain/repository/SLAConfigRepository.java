package com.igreen.domain.repository;

import com.igreen.domain.entity.SLAConfig;
import com.igreen.domain.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SLAConfigRepository extends JpaRepository<SLAConfig, String> {

    Optional<SLAConfig> findByPriority(Priority priority);

    boolean existsByPriority(Priority priority);
}
