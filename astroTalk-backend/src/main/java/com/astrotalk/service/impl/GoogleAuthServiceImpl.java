package com.astrotalk.service.impl;

import com.astrotalk.config.JwtUtil;
import com.astrotalk.model.AuthResponseModel;
import com.astrotalk.model.GoogleLoginRequestModel;
import com.astrotalk.entity.Role;
import com.astrotalk.entity.User;
import com.astrotalk.exception.InvalidCredentialsException;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.GoogleAuthService;
import com.astrotalk.service.WalletService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthServiceImpl.class);

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final WalletService walletService;

    @Value("${google.client-id}")
    private String googleClientId;

    @Override
    public AuthResponseModel authenticate(GoogleLoginRequestModel request) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalArgumentException("Google sign-in is not configured on this server.");
        }
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                log.warn("Invalid Google ID token");
                throw new InvalidCredentialsException("Google Sign-In failed. Please try again.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google auth success for email: {}", email);

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = User.builder()
                        .name(name != null ? name : email.split("@")[0])
                        .email(email)
                        .password("")  // Google users have no password
                        .profilePicture(picture)
                        .role(Role.USER)
                        .active(true)
                        .emailVerified(true)
                        .build();
                user = userRepository.save(user);
                walletService.giveSignupBonus(user.getId());
                log.info("New user created via Google: {}", email);
            }

            String token = jwtUtil.generateAccessToken(user.getEmail(), List.of(user.getRole().name()));
            return AuthResponseModel.builder()
                    .token(token)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google authentication error: ", e);
            throw new RuntimeException("Google Sign-In failed. Please try again.");
        }
    }
}
