package com.igreen.domain.repository;

import com.igreen.domain.entity.SiteLevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteLevelConfigRepository extends JpaRepository<SiteLevelConfig, String> {

    Optional<SiteLevelConfig> findByLevelName(String levelName);

    boolean existsByLevelName(String levelName);

    boolean existsByLevelNameAndIdNot(String levelName, String id);
}
