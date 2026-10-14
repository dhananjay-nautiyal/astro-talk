package com.astrotalk;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "app.jwt.secret=dGVzdC1vbmx5LXNlY3JldC0wMTIzNDU2Nzg5YWJjZGVm",
        "razorpay.key-id=test-key",
        "razorpay.key-secret=test-secret",
        "google.client-id=test.apps.googleusercontent.com"
})
@ActiveProfiles("dev")
class AstroTalkApplicationTests {

    @Test
    void contextLoads() {
    }
}
