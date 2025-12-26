package com.igreen.domain.repository;

import com.igreen.domain.entity.Group;
import com.igreen.domain.enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, String> {

    Optional<Group> findByName(String name);

    boolean existsByName(String name);

    List<Group> findByStatus(GroupStatus status);
}
