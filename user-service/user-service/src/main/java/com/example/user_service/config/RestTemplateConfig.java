package com.example.user_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    // 1. Dùng cho giao tiếp nội bộ (VD: gọi qua tên service http://auth-service)
    @Bean
    @LoadBalanced
    @Primary  // Ưu tiên cái này khi inject mặc định
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // 2. Dùng cho gọi ra ngoài hoặc gọi trực tiếp IP/Localhost (VD: gọi Keycloak)
    @Bean("externalRestTemplate")
    public RestTemplate externalRestTemplate() {
        return new RestTemplate();
    }
}