package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.User;
import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<User> {

    Optional<User> selectByIdWithGroup(@Param("id") String id);

    List<User> selectByRoleAndStatus(@Param("role") String role, @Param("status") String status);

    List<User> selectByGroupId(@Param("groupId") String groupId);

    Optional<User> selectByEmail(@Param("email") String email);

    Optional<User> selectByUsername(@Param("username") String username);

    Optional<User> selectByUsernameAndCountry(@Param("username") String username, @Param("country") String country);

    Integer countByGroupId(@Param("groupId") String groupId);
}
