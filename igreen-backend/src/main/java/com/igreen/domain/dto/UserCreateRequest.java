package com.igreen.domain.dto;

import com.igreen.domain.enums.UserRole;
import com.igreen.domain.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Objects;

@Data
public final class UserCreateRequest {
    private final @NotBlank
    @Size(min = 1, max = 255) String name;
    private final @NotBlank
    @Size(min = 3, max = 100) String username;
    private final @NotBlank
    @Size(min = 6, max = 100) String password;
    private final UserRole role;
    private final UserStatus status;
    private final String groupId;
    private final String country;

    public UserCreateRequest(@NotBlank @Size(min = 1, max = 255) String name, @NotBlank @Size(min = 3, max = 100) String username, @NotBlank @Size(min = 6, max = 100) String password, UserRole role, UserStatus status, String groupId, String country) {
        this.name = name;
        this.username = username;
        this.password = password;
        this.role = role;
        this.status = status;
        this.groupId = groupId;
        this.country = country;
    }

    public @NotBlank @Size(min = 1, max = 255) String name() {
        return name;
    }

    public @NotBlank @Size(min = 3, max = 100) String username() {
        return username;
    }

    public @NotBlank @Size(min = 6, max = 100) String password() {
        return password;
    }

    public UserRole role() {
        return role;
    }

    public UserStatus status() {
        return status;
    }

    public String groupId() {
        return groupId;
    }

    public String country() {
        return country;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) return true;
        if (obj == null || obj.getClass() != this.getClass()) return false;
        var that = (UserCreateRequest) obj;
        return Objects.equals(this.name, that.name) && Objects.equals(this.username, that.username) && Objects.equals(this.password, that.password) && Objects.equals(this.role, that.role) && Objects.equals(this.status, that.status) && Objects.equals(this.groupId, that.groupId) && Objects.equals(this.country, that.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, username, password, role, status, groupId, country);
    }

    @Override
    public String toString() {
        return "UserCreateRequest[" + "name=" + name + ", " + "username=" + username + ", " + "password=" + password + ", " + "role=" + role + ", " + "status=" + status + ", " + "groupId=" + groupId + ", " + "country=" + country + ']';
    }
}
