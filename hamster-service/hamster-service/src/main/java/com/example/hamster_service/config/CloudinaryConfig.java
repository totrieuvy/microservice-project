package com.example.hamster_service.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "duikwluky",
                "api_key", "145326116844878",
                "api_secret", "d006xOGf_6J8tl5CIwMg--RbR-I"
        ));
    }
}
