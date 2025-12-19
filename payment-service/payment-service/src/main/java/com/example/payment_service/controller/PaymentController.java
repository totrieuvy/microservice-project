package com.example.payment_service.controller;

import com.example.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public String createPaymentUrl(
            @RequestParam Long bookingId,
            @RequestParam Double amount
    ) throws Exception {
        return paymentService.createPaymentUrl(bookingId, amount);
    }

    @GetMapping("/vnpay-ipn")
    public void handleVnPayCallback(@RequestParam Map<String, String> params, HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // 🔥 LOG FULL CALLBACK URL
        String fullUrl = request.getRequestURL().toString();
        String queryString = request.getQueryString();

        if (queryString != null) {
            fullUrl += "?" + queryString;
        }

        log.info("🔥 VNPay Callback URL: {}", fullUrl);

        String redirectUrl = paymentService.handleVnPayCallback(params);
        response.sendRedirect(redirectUrl);
    }

}
