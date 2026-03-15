package com.igreen.common.typehandler;

import com.igreen.domain.enums.TicketType;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * TicketType TypeHandler
 *
 * 数据库存储: 小写 (planned, preventive, corrective, problem)
 * API 返回/接收: 小写
 * Java 枚举: 大写 (PLANNED, PREVENTIVE, CORRECTIVE, PROBLEM)
 */
@MappedTypes(TicketType.class)
public class TicketTypeTypeHandler extends BaseTypeHandler<TicketType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, TicketType parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getValue());
    }

    @Override
    public TicketType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : TicketType.fromValue(value);
    }

    @Override
    public TicketType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : TicketType.fromValue(value);
    }

    @Override
    public TicketType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : TicketType.fromValue(value);
    }
}