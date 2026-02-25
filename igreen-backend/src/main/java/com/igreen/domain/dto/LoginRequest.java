package com.igreen.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Objects;

@Data
public final class LoginRequest {
    private final @NotBlank String username;
    private final @NotBlank String password;
    private final String country;

    public LoginRequest(@NotBlank String username, @NotBlank String password, String country  // country 可选，小程序登录不传 country
    ) {
        this.username = username;
        this.password = password;
        this.country = country;
    }

    public @NotBlank String username() {
        return username;
    }

    public @NotBlank String password() {
        return password;
    }

    public String country() {
        return country;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) return true;
        if (obj == null || obj.getClass() != this.getClass()) return false;
        var that = (LoginRequest) obj;
        return Objects.equals(this.username, that.username) && Objects.equals(this.password, that.password) && Objects.equals(this.country, that.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, password, country);
    }

    @Override
    public String toString() {
        return "LoginRequest[" + "username=" + username + ", " + "password=" + password + ", " + "country=" + country + ']';
    }
}
