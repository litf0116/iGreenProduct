package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.TemplateStep;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TemplateStepMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<TemplateStep> {

    List<TemplateStep> selectByTemplateIdOrderByOrderAsc(@Param("templateId") String templateId);
}
