package com.igreen.common.exception;

public enum ErrorCode {
    USER_NOT_FOUND("USER_NOT_FOUND", "用户不存在"),
    USER_ALREADY_EXISTS("USER_ALREADY_EXISTS", "用户已存在"),
    USERNAME_EXISTS("USERNAME_EXISTS", "用户名已存在"),
    EMAIL_EXISTS("EMAIL_EXISTS", "邮箱已存在"),
    USER_INACTIVE("USER_INACTIVE", "用户未激活"),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "邮箱或密码错误"),
    UNAUTHORIZED("UNAUTHORIZED", "未授权访问"),
    FORBIDDEN("FORBIDDEN", "禁止访问"),
    TICKET_NOT_FOUND("TICKET_NOT_FOUND", "工单不存在"),
    TICKET_ALREADY_ACCEPTED("TICKET_ALREADY_ACCEPTED", "工单已被接受"),
    TICKET_INVALID_STATUS("TICKET_INVALID_STATUS", "工单状态无效"),
    NOT_ASSIGNEE("NOT_ASSIGNEE", "非工单负责人"),
    NOT_CREATOR("NOT_CREATOR", "非工单创建者"),
    TEMPLATE_NOT_FOUND("TEMPLATE_NOT_FOUND", "模板不存在"),
    TEMPLATE_EXISTS("TEMPLATE_EXISTS", "模板已存在"),
    GROUP_NOT_FOUND("GROUP_NOT_FOUND", "分组不存在"),
    GROUP_EXISTS("GROUP_EXISTS", "分组已存在"),
    SITE_NOT_FOUND("SITE_NOT_FOUND", "站点不存在"),
    SITE_EXISTS("SITE_EXISTS", "站点已存在"),
    FILE_NOT_FOUND("FILE_NOT_FOUND", "文件不存在"),
    FILE_EMPTY("FILE_EMPTY", "文件为空"),
    FILE_TOO_LARGE("FILE_TOO_LARGE", "文件大小超出限制"),
    SLA_CONFIG_NOT_FOUND("SLA_CONFIG_NOT_FOUND", "SLA配置不存在"),
    SLA_CONFIG_EXISTS("SLA_CONFIG_EXISTS", "SLA配置已存在"),
    PROBLEM_TYPE_NOT_FOUND("PROBLEM_TYPE_NOT_FOUND", "问题类型不存在"),
    PROBLEM_TYPE_EXISTS("PROBLEM_TYPE_EXISTS", "问题类型已存在"),
    SITE_LEVEL_CONFIG_NOT_FOUND("SITE_LEVEL_CONFIG_NOT_FOUND", "站点级别配置不存在"),
    SITE_LEVEL_CONFIG_EXISTS("SITE_LEVEL_CONFIG_EXISTS", "站点级别配置已存在"),
    INVALID_TOKEN("INVALID_TOKEN", "无效令牌"),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "令牌已过期"),
    INVALID_REQUEST("INVALID_REQUEST", "请求无效"),
    INTERNAL_ERROR("INTERNAL_ERROR", "内部服务器错误");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
