package com.igreen.common.context;

public final class CountryContext {

    private static final ThreadLocal<String> CURRENT_COUNTRY = new ThreadLocal<>();

    private CountryContext() {}

    public static void set(String country) {
        CURRENT_COUNTRY.set(country);
    }

    public static String get() {
        return CURRENT_COUNTRY.get();
    }

    public static void clear() {
        CURRENT_COUNTRY.remove();
    }
}