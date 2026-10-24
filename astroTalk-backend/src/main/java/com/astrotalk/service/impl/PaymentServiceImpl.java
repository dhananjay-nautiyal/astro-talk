package com.astrotalk.service.impl;

import com.astrotalk.model.PaymentVerifyRequestModel;
import com.astrotalk.model.RazorpayOrderRequestModel;
import com.astrotalk.model.RazorpayOrderResponseModel;
import com.astrotalk.model.WalletResponseModel;
import com.astrotalk.entity.PaymentOrder;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.exception.UnauthorizedAccessException;
import com.astrotalk.repository.PaymentOrderRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.PaymentService;
import com.astrotalk.service.WalletService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String ORDER_STATUS_PENDING = "PENDING";
    private static final String ORDER_STATUS_COMPLETED = "COMPLETED";

    private final RazorpayClient razorpayClient;
    private final WalletService walletService;
    private final UserRepository userRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Override
    @Transactional
    public RazorpayOrderResponseModel createOrder(RazorpayOrderRequestModel request, String email) {
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email))
                .getId();

        try {
            JSONObject orderRequest = new JSONObject();
            int amountInPaise = request.getAmount().multiply(BigDecimal.valueOf(100)).intValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            // Persist the order server-side so verification can check ownership,
            // amount, and consumption. Without this the verify step had nothing to
            // validate against and could be replayed.
            paymentOrderRepository.save(PaymentOrder.builder()
                    .userId(userId)
                    .razorpayOrderId(razorpayOrderId)
                    .amount(request.getAmount())
                    .currency("INR")
                    .status(ORDER_STATUS_PENDING)
                    .build());

            return RazorpayOrderResponseModel.builder()
                    .orderId(razorpayOrderId)
                    .amount(request.getAmount())
                    .currency("INR")
                    .keyId(keyId)
                    .build();

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public WalletResponseModel verifyPayment(PaymentVerifyRequestModel request, String email) {
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email))
                .getId();

        PaymentOrder order = paymentOrderRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order", "razorpayOrderId",
                        request.getRazorpayOrderId()));

        // Ownership: the order must belong to the caller.
        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Payment order does not belong to this user");
        }

        // Replay/idempotency: an already-consumed order must not credit the wallet again.
        if (ORDER_STATUS_COMPLETED.equals(order.getStatus())) {
            throw new UnauthorizedAccessException("Payment order has already been processed");
        }

        // Signature: validate the Razorpay signature over order|payment.
        String generatedSignature = generateSignature(
                request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId());
        if (!generatedSignature.equals(request.getRazorpaySignature())) {
            throw new UnauthorizedAccessException("Invalid payment signature");
        }

        // Credit the actual order amount (not a hardcoded value), then mark consumed.
        WalletResponseModel response = walletService.addBalance(userId, order.getAmount(),
                "Payment via Razorpay (Order: " + request.getRazorpayOrderId() + ")");

        order.setStatus(ORDER_STATUS_COMPLETED);
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setRazorpaySignature(request.getRazorpaySignature());
        paymentOrderRepository.save(order);

        return response;
    }

    private String generateSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hmacBytes) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate payment signature", e);
        }
    }
}
