package com.example.common_websocket.common;

import com.example.common_websocket.common.config.WebSocketConfig;
import com.example.common_websocket.common.config.WebSocketProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

@Configuration
@EnableWebSocketMessageBroker
@EnableConfigurationProperties(WebSocketProperties.class)
@Import(WebSocketConfig.class)
@ConditionalOnProperty(
        name = "app.websocket.enabled",
        havingValue = "true",
        matchIfMissing = false
)
public class WebSocketAutoConfig {
}
