package com.example.payment_service.controller;

import com.example.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

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
    public void handleVnPayCallback(@RequestParam Map<String, String> params, HttpServletResponse response)
            throws IOException {

        String redirectUrl = paymentService.handleVnPayCallback(params);
        response.sendRedirect(redirectUrl);
    }

}
