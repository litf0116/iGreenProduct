package com.igreen.domain.repository;

import com.igreen.domain.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<Template, String> {

    Optional<Template> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT t FROM Template t LEFT JOIN FETCH t.steps WHERE t.id = :id")
    Optional<Template> findByIdWithSteps(@Param("id") String id);

    @Query("SELECT t FROM Template t LEFT JOIN FETCH t.steps s LEFT JOIN FETCH s.fields WHERE t.id = :id")
    Optional<Template> findByIdWithStepsAndFields(@Param("id") String id);
}
