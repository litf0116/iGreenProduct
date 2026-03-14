package com.igreen.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.igreen.domain.entity.Site;
import com.igreen.domain.enums.SiteStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SiteMapper extends com.baomidou.mybatisplus.core.mapper.BaseMapper<Site> {

    int countByName(@Param("name") String name);

    int countByCode(@Param("code") String code);

    List<Site> selectByNameContaining(@Param("name") String name);

    List<Site> selectByStatus(@Param("status") String status);
}
