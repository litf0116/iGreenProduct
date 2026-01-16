package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.Template;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface TemplateMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<Template> {

    Optional<Template> selectByName(@Param("name") String name);

    int countByName(@Param("name") String name);
}
