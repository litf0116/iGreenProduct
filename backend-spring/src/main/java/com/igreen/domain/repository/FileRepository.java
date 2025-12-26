package com.igreen.domain.repository;

import com.igreen.domain.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<File, String> {

    List<File> findByFieldType(String fieldType);
}
