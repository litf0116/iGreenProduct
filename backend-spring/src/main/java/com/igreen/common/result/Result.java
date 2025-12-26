package com.igreen.common.result;

public record Result<T>(
        boolean success,
        String message,
        T data,
        String code
) {
    public static <T> Result<T> success(T data) {
        return new Result<>(true, "Success", data, "200");
    }

    public static <T> Result<T> successResult() {
        return new Result<>(true, "Success", null, "200");
    }

    public static <T> Result<T> error(String message, String code) {
        return new Result<>(false, message, null, code);
    }
}
