package com.astrotalk.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration that enables STOMP message broker, registers the /ws endpoint
 * with SockJS fallback, and configures the JWT handshake interceptor for inbound channels.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final WebSocketSubscriptionInterceptor webSocketSubscriptionInterceptor;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * Configures the simple message broker with /topic and /queue destinations
     * and sets /app as the application destination prefix.
     *
     * @param config the MessageBrokerRegistry to configure
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registers the /ws STOMP endpoint with SockJS fallback. Allowed origins
     * come from app.cors.allowed-origins so WS and HTTP share one list.
     *
     * @param registry the StompEndpointRegistry to register endpoints with
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.split(","))
                .withSockJS();
    }

    /**
     * Adds the JWT handshake interceptor to authenticate incoming STOMP connections and
     * the subscription interceptor to authorize every SUBSCRIBE against the principal.
     *
     * @param registration the ChannelRegistration to add interceptors to
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtHandshakeInterceptor, webSocketSubscriptionInterceptor);
    }
}
