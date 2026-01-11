package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.TemplateField;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TemplateFieldMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<TemplateField> {

    List<TemplateField> selectByStepId(@Param("stepId") String stepId);
}
