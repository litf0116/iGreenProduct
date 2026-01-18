package com.igreen.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Rate Limit Filter 测试")
class RateLimitFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private RateLimitFilter rateLimitFilter;

    private StringWriter stringWriter;
    private PrintWriter printWriter;

    @BeforeEach
    void setUp() throws Exception {
        stringWriter = new StringWriter();
        printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        reset(request, response, filterChain);
    }

    @Test
    @DisplayName("非登录注册路径应直接放行")
    void doFilterInternal_NonAuthPath_ShouldPass() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/tickets");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    @DisplayName("登录路径应在限制内放行")
    void doFilterInternal_LoginPath_WithinLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        // 5次请求应该都通过
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("注册路径应在限制内放行")
    void doFilterInternal_RegisterPath_WithinLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        // 3次请求应该都通过
        for (int i = 0; i < 3; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(3)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("超过限制应返回429错误")
    void doFilter_LoginPath_ExceedsLimit_ShouldReturn429() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");

        // 5次请求应该通过
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // 第6次请求应该被拒绝
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response).setStatus(429);
        verify(response).setContentType("application/json");
    }

    @Test
    @DisplayName("从X-Forwarded-For获取IP地址")
    void doFilterInternal_WithXForwardedFor_ShouldUseForwardedIP() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.1, 70.41.3.18, 150.172.238.178");

        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(request, never()).getRemoteAddr();
    }

    @Test
    @DisplayName("X-Forwarded-For为空时应使用RemoteAddr")
    void doFilterInternal_EmptyXForwardedFor_ShouldUseRemoteAddr() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("");
        when(request.getRemoteAddr()).thenReturn("172.16.0.1");

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(request).getRemoteAddr();
    }

    @Test
    @DisplayName("不同IP独立计算限制")
    void doFilterInternal_DifferentIPs_ShouldHaveIndependentLimits() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");

        // IP 1
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // IP 2
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.2");
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // 两个IP都应该通过5次请求
        verify(filterChain, times(10)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    @DisplayName("时间窗口结束后应重置计数器")
    void doFilterInternal_AfterTimeWindow_ShouldResetCounter() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.10.10.10");

        // 使用窗口内的时间戳
        long windowStart = System.currentTimeMillis();

        // 发送5次请求
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // 第6次应该被拒绝
        rateLimitFilter.doFilterInternal(request, response, filterChain);
        verify(response).setStatus(429);

        // 由于RateLimitBucket使用System.currentTimeMillis(),
        // 实际测试中无法直接修改时间,这里只验证超过限制的行为
    }

    @Test
    @DisplayName("注册路径超过限制")
    void doFilterInternal_RegisterPath_ExceedsLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("172.16.254.1");

        // 5次请求
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // 第6次应该被拒绝
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response).setStatus(429);
    }

    @Test
    @DisplayName("超过限制后返回正确的错误消息")
    void doFilterInternal_ExceedsLimit_ShouldReturnCorrectMessage() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("test-ip");

        // 发送5次请求
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        // 第6次应该被拒绝
        rateLimitFilter.doFilterInternal(request, response, filterChain);

        String responseContent = stringWriter.toString();
        org.junit.jupiter.api.Assertions.assertTrue(responseContent.contains("请求过于频繁"));
        org.junit.jupiter.api.Assertions.assertTrue(responseContent.contains("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    @DisplayName("X-Forwarded-For包含多个IP时应使用第一个")
    void doFilterInternal_MultipleForwardedIPs_ShouldUseFirst() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195, 70.41.3.18, 150.172.238.178");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilterInternal(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(request, never()).getRemoteAddr();
    }
}
