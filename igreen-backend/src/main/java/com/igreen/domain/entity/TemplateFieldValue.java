package com.igreen.domain.entity;

import lombok.Data;

@Data
public class TemplateFieldValue extends TemplateField {
    //    存储当前字段的填写值。可以字符串 或者是 json 传 （结构数据）
    private String value;           // 单值字段（TEXT, NUMBER, DATE, INSPECTION）
}
