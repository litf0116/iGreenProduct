package com.igreen.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.rate-limit.max-requests:5}")
    private int maxRequests;

    @Value("${app.rate-limit.window-seconds:60}")
    private int windowSeconds;

    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 跳过 OPTIONS 预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (!path.equals("/api/auth/login") && !path.equals("/api/auth/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 如果 rate limit 未启用，直接放行
        if (!rateLimitEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        RateLimitBucket bucket = buckets.computeIfAbsent(clientIp, k -> new RateLimitBucket());

        long windowSizeMs = windowSeconds * 1000L;
        if (!bucket.tryAcquire(windowSizeMs, maxRequests)) {
            log.warn("Rate limit exceeded for IP: {}", clientIp);
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"请求过于频繁，请稍后再试\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitBucket {
        private final AtomicInteger counter = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        public synchronized boolean tryAcquire(long windowSizeMs, int maxRequests) {
            long now = System.currentTimeMillis();
            if (now - windowStart > windowSizeMs) {
                windowStart = now;
                counter.set(0);
            }
            return counter.incrementAndGet() <= maxRequests;
        }
    }
}
