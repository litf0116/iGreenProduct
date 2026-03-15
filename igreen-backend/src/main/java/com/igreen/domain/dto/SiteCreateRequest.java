package com.igreen.domain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.igreen.domain.enums.SiteStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SiteCreateRequest {
    @Size(max = 100)
    private String code;
    @NotBlank
    @Size(max = 255)
    private String name;
    @Size(max = 1000)
    private String address;
    @Size(max = 50)
    private String level;
    private SiteStatus status;
}
