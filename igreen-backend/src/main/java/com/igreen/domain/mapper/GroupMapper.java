package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.Group;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GroupMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<Group> {

    int countByName(@Param("name") String name);

    Group selectById(@Param("id") String id);
}
