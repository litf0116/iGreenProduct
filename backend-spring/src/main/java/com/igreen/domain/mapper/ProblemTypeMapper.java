package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.ProblemType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface ProblemTypeMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<ProblemType> {

    Optional<ProblemType> selectByName(@Param("name") String name);

    int countByNameAndIdNot(@Param("name") String name, @Param("id") String id);
}
