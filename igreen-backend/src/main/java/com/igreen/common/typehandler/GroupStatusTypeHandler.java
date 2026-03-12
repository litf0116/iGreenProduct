package com.igreen.common.typehandler;

import com.igreen.domain.enums.GroupStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(GroupStatus.class)
public class GroupStatusTypeHandler extends BaseTypeHandler<GroupStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, GroupStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public GroupStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : GroupStatus.valueOf(value.toUpperCase());
    }

    @Override
    public GroupStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : GroupStatus.valueOf(value.toUpperCase());
    }

    @Override
    public GroupStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : GroupStatus.valueOf(value.toUpperCase());
    }
}