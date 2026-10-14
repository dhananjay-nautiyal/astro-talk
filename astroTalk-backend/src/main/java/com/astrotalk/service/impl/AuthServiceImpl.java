package com.astrotalk.service.impl;

import com.astrotalk.config.JwtUtil;
import com.astrotalk.model.*;
import com.astrotalk.entity.Astrologer;
import com.astrotalk.entity.Role;
import com.astrotalk.entity.User;
import com.astrotalk.exception.DuplicateResourceException;
import com.astrotalk.exception.EmailNotFoundException;
import com.astrotalk.exception.InvalidCredentialsException;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.entity.Token;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.TokenRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.AuthService;
import com.astrotalk.service.WalletService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WalletService walletService;

    @Override
    public AuthResponseModel registerUser(RegisterRequestModel request) {
        request.setEmail(request.getEmail().trim().toLowerCase());
        log.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Duplicate registration attempt for email: {}", request.getEmail());
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .timeOfBirth(request.getTimeOfBirth())
                .placeOfBirth(request.getPlaceOfBirth())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .gender(request.getGender())
                .role(Role.USER)
                .active(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        walletService.giveSignupBonus(user.getId());
        String token = jwtUtil.generateAccessToken(user.getEmail(), List.of(user.getRole().name()));

        log.info("User registered successfully: {} (id={})", user.getEmail(), user.getId());
        return AuthResponseModel.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponseModel registerAstrologer(RegisterAstrologerRequestModel request) {
        request.setEmail(request.getEmail().trim().toLowerCase());
        log.info("Registering astrologer with email: {}", request.getEmail());

        if (astrologerRepository.existsByEmail(request.getEmail())) {
            log.warn("Duplicate astrologer registration attempt for email: {}", request.getEmail());
            throw new DuplicateResourceException("Astrologer", "email", request.getEmail());
        }

        Astrologer astrologer = Astrologer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .bio(request.getBio())
                .specialization(request.getSpecialization())
                .yearsOfExperience(request.getYearsOfExperience())
                .languages(request.getLanguages())
                .consultationFee(request.getConsultationFee())
                .role(Role.ASTROLOGER)
                .rating(0.0)
                .totalConsultations(0)
                .isAvailable(true)
                .isVerified(false)
                .build();

        astrologer = astrologerRepository.save(astrologer);
        String token = jwtUtil.generateAccessToken(astrologer.getEmail(), List.of(astrologer.getRole().name()));

        log.info("Astrologer registered successfully: {} (id={})", astrologer.getEmail(), astrologer.getId());
        return AuthResponseModel.builder()
                .token(token)
                .id(astrologer.getId())
                .name(astrologer.getName())
                .email(astrologer.getEmail())
                .role(astrologer.getRole())
                .build();
    }

    @Override
    public AuthResponseModel login(LoginRequestModel request) {
        request.setEmail(request.getEmail().trim().toLowerCase());
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Incorrect password for user email: {}", request.getEmail());
                throw new InvalidCredentialsException("Incorrect password. Please try again.");
            }
            String token = jwtUtil.generateAccessToken(user.getEmail(), List.of(user.getRole().name()));
            log.info("User login successful: {} (role=USER)", user.getEmail());
            return AuthResponseModel.builder()
                    .token(token)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();
        }

        Astrologer astrologer = astrologerRepository.findByEmail(request.getEmail()).orElse(null);

        if (astrologer == null) {
            log.warn("No account found for email: {}", request.getEmail());
            throw new EmailNotFoundException("No account found with this email.");
        }

        if (!passwordEncoder.matches(request.getPassword(), astrologer.getPassword())) {
            log.warn("Incorrect password for astrologer email: {}", request.getEmail());
            throw new InvalidCredentialsException("Incorrect password. Please try again.");
        }

        String token = jwtUtil.generateAccessToken(astrologer.getEmail(), List.of(astrologer.getRole().name()));
        log.info("Astrologer login successful: {} (role=ASTROLOGER)", astrologer.getEmail());
        return AuthResponseModel.builder()
                .token(token)
                .id(astrologer.getId())
                .name(astrologer.getName())
                .email(astrologer.getEmail())
                .role(astrologer.getRole())
                .build();
    }

    @Override
    public AuthResponseModel refreshToken(RefreshTokenModel request) {
        String email = jwtUtil.extractEmail(request.getRefreshToken());
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String token = jwtUtil.generateAccessToken(email, List.of(user.getRole().name()));
            return AuthResponseModel.builder().token(token).id(user.getId()).name(user.getName()).email(user.getEmail()).role(user.getRole()).build();
        }
        Astrologer astrologer = astrologerRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateAccessToken(email, List.of(astrologer.getRole().name()));
        return AuthResponseModel.builder().token(token).id(astrologer.getId()).name(astrologer.getName()).email(astrologer.getEmail()).role(astrologer.getRole()).build();
    }

    @Override
    public void logout(String accessToken) {
        log.info("Logout request");
        Optional<Token> tokenOpt = tokenRepository.findByAccessToken(accessToken);
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            token.setActive(false);
            tokenRepository.save(token);
            log.info("Token invalidated for email: {}", token.getEmail());
        } else {
            log.warn("Token not found in database, skipping invalidation");
        }
    }

    @Override
    public void forgetPassword(String email) {
        log.info("Forget password request for email: {}", email);
    }

    @Override
    public void resetPassword(String token, String password, String confirmPassword) {
        log.info("Reset password with token");
    }

    @Override
    public UserResponseModel getCurrentUser(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return toUserResponse(userOpt.get());
        }
        Astrologer astrologer = astrologerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return toUserResponse(astrologer);
    }

    @Override
    @Transactional
    public UserResponseModel updateProfile(String email, UpdateProfileRequestModel request) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
            if (request.getPlaceOfBirth() != null) user.setPlaceOfBirth(request.getPlaceOfBirth());
            if (request.getGender() != null) user.setGender(request.getGender());
            if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
            user = userRepository.save(user);
            return toUserResponse(user);
        }
        Astrologer astrologer = astrologerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (request.getName() != null) astrologer.setName(request.getName());
        if (request.getPhone() != null) astrologer.setPhone(request.getPhone());
        if (request.getProfilePicture() != null) astrologer.setProfilePicture(request.getProfilePicture());
        astrologer = astrologerRepository.save(astrologer);
        return toUserResponse(astrologer);
    }

    private UserResponseModel toUserResponse(User user) {
        return UserResponseModel.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .phone(user.getPhone()).dateOfBirth(user.getDateOfBirth())
                .timeOfBirth(user.getTimeOfBirth()).placeOfBirth(user.getPlaceOfBirth())
                .latitude(user.getLatitude()).longitude(user.getLongitude())
                .gender(user.getGender()).profilePicture(user.getProfilePicture())
                .role(user.getRole()).emailVerified(user.isEmailVerified())
                .active(user.isActive()).createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt()).build();
    }

    private UserResponseModel toUserResponse(Astrologer astrologer) {
        return UserResponseModel.builder()
                .id(astrologer.getId()).name(astrologer.getName()).email(astrologer.getEmail())
                .phone(astrologer.getPhone()).profilePicture(astrologer.getProfilePicture())
                .role(astrologer.getRole()).active(true)
                .createdAt(astrologer.getCreatedAt())
                .updatedAt(astrologer.getUpdatedAt()).build();
    }
}
