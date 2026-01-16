package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.SiteLevelConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SiteLevelConfigMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<SiteLevelConfig> {

    int countByLevelName(@Param("levelName") String levelName);

    int countByLevelNameAndIdNot(@Param("levelName") String levelName, @Param("id") String id);
}
