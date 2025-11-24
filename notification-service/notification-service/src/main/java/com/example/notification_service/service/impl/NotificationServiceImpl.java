package com.example.notification_service.service.impl;
import com.example.notification_service.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;
    private final TemplateEngine templateEngine;

    public void sendOtp(Long userId, String email, String name, String activationToken) {

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        redisTemplate.opsForValue().set("OTP:" + userId, otp, Duration.ofMinutes(10));

        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("otp", otp);
        context.setVariable("token", activationToken);

        String htmlContent = templateEngine.process("otp-email", context);

        sendHtmlMail(email, "Your OTP Code", htmlContent);
    }

    @Override
    public boolean verifyOtp(Long userId, String otp) {

        String key = "OTP:" + userId;

        String cachedOtp = redisTemplate.opsForValue().get(key);

        if (cachedOtp == null) return false;
        if (!cachedOtp.equals(otp)) return false;

        redisTemplate.delete(key);
        return true;
    }


    private void sendHtmlMail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
