package com.igreen.domain.repository;

import com.igreen.domain.entity.TemplateField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateFieldRepository extends JpaRepository<TemplateField, String> {

    List<TemplateField> findByStepId(String stepId);
}
