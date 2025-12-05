package com.example.payment_service.service.impl;

import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final RestTemplate restTemplate;

    @Override
    public String createPaymentUrl(Long bookingId, Double amount) throws Exception {
        return generateVnPayUrl(bookingId, amount);
    }

    @Override
    public String handleVnPayCallback(Map<String, String> params) {

        String orderInfo = params.get("vnp_OrderInfo");
        Long bookingId = Long.parseLong(orderInfo.replace("ThanhToanBooking", ""));

        String responseCode = params.get("vnp_ResponseCode");
        boolean success = "00".equals(responseCode);

        // Gọi booking-service update trạng thái
        String notifyUrl = "http://booking-service/api/booking/payment-callback";

        Map<String, Object> body = Map.of(
                "bookingId", bookingId,
                "responseCode", responseCode
        );

        restTemplate.postForObject(notifyUrl, body, Void.class);

        // Redirect về FE
        return success
                ? "http://localhost:5173/payment-success?bookingId=" + bookingId
                : "http://localhost:5173/payment-cancel?bookingId=" + bookingId;
    }

    //  Tạo link VNPay
    private String generateVnPayUrl(Long bookingId, double totalAmount) throws Exception {

        String tmnCode = "BFN7TDLO";
        String secretKey = "3P6RUU6PJ4GY1UFS1IWWNURP6DV2AHQQ";
        String vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

        String returnUrl = "http://localhost:8090/api/payments/vnpay-ipn   ";

        String amount = String.valueOf((long) (totalAmount * 100));

        String txnRef = "BOOK" + System.currentTimeMillis();

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", amount);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "ThanhToanBooking" + bookingId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII);
            String value = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);

            if (hashData.length() > 0) hashData.append('&');
            hashData.append(key).append('=').append(value);

            if (query.length() > 0) query.append('&');
            query.append(key).append('=').append(value);
        }

        String secureHash = hmacSHA512(secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        return vnpUrl + "?" + query;
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac.init(secretKey);

        byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) hash.append(String.format("%02x", b));
        return hash.toString();
    }
}
