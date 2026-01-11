package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.SLAConfig;
import com.igreen.domain.enums.Priority;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface SLAConfigMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<SLAConfig> {

    Optional<SLAConfig> selectByPriority(@Param("priority") String priority);
}
