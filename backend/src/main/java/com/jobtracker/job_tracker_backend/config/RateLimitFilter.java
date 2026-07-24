package com.jobtracker.job_tracker_backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Giới hạn nghiêm ngặt cho Auth: tối đa 5 lần / 5 phút / IP
    private static final int AUTH_MAX_ATTEMPTS = 5;
    private static final long AUTH_WINDOW_MS = 5 * 60 * 1000;

    // Giới hạn chung cho toàn bộ API: tối đa 100 request / 1 phút / IP
    private static final int GENERAL_MAX_ATTEMPTS = 100;
    private static final long GENERAL_WINDOW_MS = 60 * 1000;

    private final Map<String, RequestWindow> authAttemptsByIp = new ConcurrentHashMap<>();
    private final Map<String, RequestWindow> generalAttemptsByIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = getClientIp(request);

        // Tầng 1: giới hạn chung cho mọi API
        if (path.startsWith("/api/")) {
            if (isRateLimited(generalAttemptsByIp, ip, GENERAL_MAX_ATTEMPTS, GENERAL_WINDOW_MS)) {
                sendTooManyRequests(response, "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.");
                return;
            }
        }

        // Tầng 2: giới hạn nghiêm ngặt riêng cho Auth
        boolean isAuthPath = path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/google");

        if (isAuthPath) {
            if (isRateLimited(authAttemptsByIp, ip, AUTH_MAX_ATTEMPTS, AUTH_WINDOW_MS)) {
                sendTooManyRequests(response, "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, RequestWindow> store, String ip, int maxAttempts, long windowMs) {
        RequestWindow window = store.computeIfAbsent(ip, k -> new RequestWindow());
        long now = System.currentTimeMillis();

        synchronized (window) {
            if (now - window.windowStart > windowMs) {
                window.windowStart = now;
                window.count.set(0);
            }

            int currentCount = window.count.incrementAndGet();
            return currentCount > maxAttempts;
        }
    }

    private void sendTooManyRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\",\"status\":429}");
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestWindow {
        long windowStart = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(0);
    }
}