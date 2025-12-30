package com.example.common_websocket.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.websocket")
public class WebSocketProperties {

    private String endpoint = "/websocket";
    private String[] allowedOrigins = {"*"};
}
