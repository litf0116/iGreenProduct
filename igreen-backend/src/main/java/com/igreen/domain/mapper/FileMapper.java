package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.File;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FileMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<File> {

    List<File> selectByFieldType(@Param("fieldType") String fieldType);
}
