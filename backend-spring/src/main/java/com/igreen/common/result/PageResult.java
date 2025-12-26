package com.igreen.common.result;

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
}
