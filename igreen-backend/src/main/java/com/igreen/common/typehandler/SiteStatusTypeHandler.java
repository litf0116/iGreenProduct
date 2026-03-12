package com.igreen.common.typehandler;

import com.igreen.domain.enums.SiteStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(SiteStatus.class)
public class SiteStatusTypeHandler extends BaseTypeHandler<SiteStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, SiteStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public SiteStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : SiteStatus.valueOf(value.toUpperCase());
    }

    @Override
    public SiteStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : SiteStatus.valueOf(value.toUpperCase());
    }

    @Override
    public SiteStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : SiteStatus.valueOf(value.toUpperCase());
    }
}