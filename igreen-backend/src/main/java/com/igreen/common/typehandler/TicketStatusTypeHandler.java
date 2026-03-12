package com.igreen.common.typehandler;

import com.igreen.domain.enums.TicketStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * TicketStatus TypeHandler
 *
 * 数据库存储: 大写 (OPEN, ASSIGNED, ...)
 * API 返回/接收: 小写 (open, assigned, ...)
 *
 * 转换逻辑:
 * - Java → DB: 枚举值转大写字符串存储
 * - DB → Java: 大写字符串转枚举值
 * - API 序列化: 通过 @JsonValue/ @JsonCreator 自动转小写
 */
@MappedTypes(TicketStatus.class)
public class TicketStatusTypeHandler extends BaseTypeHandler<TicketStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, TicketStatus parameter, JdbcType jdbcType) throws SQLException {
        // 存储大写值到数据库
        ps.setString(i, parameter.name());
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : TicketStatus.valueOf(value.toUpperCase());
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : TicketStatus.valueOf(value.toUpperCase());
    }

    @Override
    public TicketStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : TicketStatus.valueOf(value.toUpperCase());
    }
}