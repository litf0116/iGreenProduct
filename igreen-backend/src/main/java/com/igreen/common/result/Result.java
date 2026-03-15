package com.igreen.common.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private boolean success;
    private String message;
    private T data;
    private String code;

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
