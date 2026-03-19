package com.igreen.domain.enums;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum CountryCode {
    CHINA("CN", "China", "中国"),
    THAILAND("TH", "Thailand", "ไทย"),
    INDONESIA("ID", "Indonesia", "อินโดนีเซีย"),
    BRAZIL("BR", "Brazil", "บราซิล"),
    MEXICO("MX", "Mexico", "เม็กซิโก");

    private final String code;
    private final String nameEn;
    private final String nameTh;

    private static final Map<String, CountryCode> CODE_MAP = Arrays.stream(values())
            .collect(Collectors.toMap(CountryCode::getCode, Function.identity()));

    private static final Map<String, CountryCode> NAME_MAP = Arrays.stream(values())
            .collect(Collectors.toMap(
                    c -> c.getNameEn().toLowerCase(),
                    Function.identity(),
                    (existing, replacement) -> existing
            ));

    CountryCode(String code, String nameEn, String nameTh) {
        this.code = code;
        this.nameEn = nameEn;
        this.nameTh = nameTh;
    }

    public String getCode() {
        return code;
    }

    public String getNameEn() {
        return nameEn;
    }

    public String getNameTh() {
        return nameTh;
    }

    public String getName(String language) {
        return "th".equalsIgnoreCase(language) ? nameTh : nameEn;
    }

    public static CountryCode fromCode(String code) {
        CountryCode country = CODE_MAP.get(code);
        if (country == null) {
            throw new IllegalArgumentException("Unknown country code: " + code);
        }
        return country;
    }

    public static CountryCode fromName(String name) {
        CountryCode country = NAME_MAP.get(name.toLowerCase());
        if (country == null) {
            throw new IllegalArgumentException("Unknown country name: " + name);
        }
        return country;
    }

    public static CountryCode fromNameOrCode(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Country value cannot be null or blank");
        }
        CountryCode country = CODE_MAP.get(value.toUpperCase());
        if (country != null) {
            return country;
        }
        return fromName(value);
    }

    public static List<String> getAllCodes() {
        return Arrays.stream(values())
                .map(CountryCode::getCode)
                .collect(Collectors.toList());
    }

    public static List<CountryCode> getAllCountries() {
        return Arrays.asList(values());
    }

    public static boolean isValidCode(String code) {
        return CODE_MAP.containsKey(code);
    }

    public static boolean isValidCountry(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        return CODE_MAP.containsKey(value.toUpperCase()) || NAME_MAP.containsKey(value.toLowerCase());
    }

    public static String[] splitCountries(String countries) {
        if (countries == null || countries.isBlank()) {
            return new String[0];
        }
        return countries.split(",");
    }

    public static List<CountryCode> parseCountries(String countries) {
        String[] codes = splitCountries(countries);
        return Arrays.stream(codes)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(CountryCode::fromCode)
                .collect(Collectors.toList());
    }

    @Override
    public String toString() {
        return String.format("%s (%s)", nameEn, code);
    }
}
