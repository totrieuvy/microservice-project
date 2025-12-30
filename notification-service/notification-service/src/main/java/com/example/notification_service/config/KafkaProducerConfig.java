//package com.example.notification_service.config;
//
//import com.example.notification_service.dto.NotificationEvent;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.kafka.core.KafkaTemplate;
//import org.springframework.kafka.core.ProducerFactory;
//
//@Configuration
//public class KafkaProducerConfig {
//
//    @Bean
//    public KafkaTemplate<String, NotificationEvent> kafkaTemplate(
//            ProducerFactory<String, NotificationEvent> producerFactory) {
//        return new KafkaTemplate<>(producerFactory);
//    }
//}
//
