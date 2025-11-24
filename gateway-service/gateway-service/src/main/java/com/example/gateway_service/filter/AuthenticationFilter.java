package com.example.gateway_service.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

// Thêm thư viện logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.List;


@Component
public class AuthenticationFilter implements GlobalFilter {

    // Thêm Logger để debug
    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class);

    private static final List<String> PUBLIC_API = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify-otp"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath().toLowerCase();

        // Log để xem path thực sự là gì
        log.info("Request path received: {}", path);

        if (isPublicApi(path)) {
            log.info("Path is public: {}. Allowing request...", path);
            return chain.filter(exchange);
        }

        log.warn("Path is private: {}. Checking authorization...", path);

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (token.length() < 10) {
            log.warn("Invalid Token for path: {}", path);
            return unauthorized(exchange, "Invalid Token");
        }

        log.info("Token validated. Forwarding request for path: {}", path);
        return chain.filter(exchange);
    }

    private boolean isPublicApi(String path) {
        // Dùng .anyMatch(api -> path.startsWith(api)) cho rõ ràng
        boolean isPublic = PUBLIC_API.stream().anyMatch(api -> path.startsWith(api));

        log.info("Checking if path '{}' is public against list {}. Result: {}", path, PUBLIC_API, isPublic);
        return isPublic;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        DataBuffer buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(message.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}