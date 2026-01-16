package com.igreen.common.result;

import com.github.pagehelper.PageInfo;

import java.util.List;

public record PageResult<T>(
        List<T> records,
        long total,
        int current,
        int size,
        boolean hasNext
) {
    public static <T> PageResult<T> of(List<T> records, long total, int current, int size) {
        return new PageResult<>(records, total, current, size, (current * size) < total);
    }

    public static <T> PageResult<T> of(PageInfo<T> pageInfo) {
        return new PageResult<>(
                pageInfo.getList(),
                pageInfo.getTotal(),
                pageInfo.getPageNum(),
                pageInfo.getPageSize(),
                pageInfo.isHasNextPage()
        );
    }

    public static <T> PageResult<T> of(PageInfo<?> pageInfo, List<T> records) {
        return new PageResult<>(
                records,
                pageInfo.getTotal(),
                pageInfo.getPageNum(),
                pageInfo.getPageSize(),
                pageInfo.isHasNextPage()
        );
    }
}
