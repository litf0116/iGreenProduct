package com.igreen.domain.repository;

import com.igreen.domain.entity.ProblemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemTypeRepository extends JpaRepository<ProblemType, String> {

    Optional<ProblemType> findByName(String name);

    boolean existsByName(String name);
}
