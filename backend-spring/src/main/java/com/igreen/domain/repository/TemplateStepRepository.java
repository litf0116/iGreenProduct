package com.igreen.domain.repository;

import com.igreen.domain.entity.TemplateStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateStepRepository extends JpaRepository<TemplateStep, String> {

    List<TemplateStep> findByTemplateIdOrderByOrderAsc(String templateId);
}
