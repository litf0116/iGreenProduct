package com.igreen.common.result;

import com.github.pagehelper.PageInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private List<T> records;
    private long total;
    private int current;
    private int size;
    private boolean hasNext;

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
