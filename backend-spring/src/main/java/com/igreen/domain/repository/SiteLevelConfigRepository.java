package com.igreen.domain.repository;

import com.igreen.domain.entity.SiteLevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteLevelConfigRepository extends JpaRepository<SiteLevelConfig, String> {

    Optional<SiteLevelConfig> findByName(String name);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, String id);
}
