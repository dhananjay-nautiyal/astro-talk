package com.astrotalk.service.impl;

import com.astrotalk.model.ConsultationResponseModel;
import com.astrotalk.model.StartConsultationRequestModel;
import com.astrotalk.entity.*;
import com.astrotalk.exception.InsufficientBalanceException;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.exception.UnauthorizedAccessException;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.ConsultationRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.ConsultationService;
import com.astrotalk.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;
    private final WalletService walletService;

    @Override
    @Transactional
    public ConsultationResponseModel startConsultation(Long userId, StartConsultationRequestModel request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Astrologer astrologer = astrologerRepository.findById(request.getAstrologerId())
                .orElseThrow(() -> new ResourceNotFoundException("Astrologer", request.getAstrologerId()));

        if (astrologer.getStatus() != AstrologerStatus.ONLINE) {
            throw new RuntimeException("Astrologer is not available for consultation");
        }

        BigDecimal pricePerMinute = astrologer.getConsultationFee();
        if (pricePerMinute == null || pricePerMinute.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Astrologer has not set a consultation fee");
        }

        if (user.getWalletBalance().compareTo(pricePerMinute) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient wallet balance. At least " + pricePerMinute + " required to start.");
        }

        Consultation consultation = Consultation.builder()
                .user(user)
                .astrologer(astrologer)
                .type(request.getType())
                .status(ConsultationStatus.ACTIVE)
                .startTime(LocalDateTime.now())
                .durationMinutes(0)
                .totalAmount(BigDecimal.ZERO)
                .astrologerEarning(BigDecimal.ZERO)
                .platformCommission(BigDecimal.ZERO)
                .build();

        consultation = consultationRepository.save(consultation);

        astrologer.setStatus(AstrologerStatus.BUSY);
        astrologerRepository.save(astrologer);

        return toConsultationResponse(consultation);
    }

    @Override
    @Transactional
    public ConsultationResponseModel endConsultation(Long consultationId) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", consultationId));

        if (consultation.getStatus() != ConsultationStatus.ACTIVE) {
            throw new RuntimeException("Consultation is not active");
        }

        LocalDateTime endTime = LocalDateTime.now();
        long minutes = Duration.between(consultation.getStartTime(), endTime).toMinutes();
        if (minutes < 1) minutes = 1;

        BigDecimal pricePerMinute = consultation.getAstrologer().getConsultationFee();
        BigDecimal totalAmount = pricePerMinute.multiply(BigDecimal.valueOf(minutes));
        BigDecimal astrologerEarning = totalAmount.multiply(BigDecimal.valueOf(0.7));
        BigDecimal platformCommission = totalAmount.subtract(astrologerEarning);

        BigDecimal remainingAmount = totalAmount.subtract(consultation.getTotalAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            walletService.deductBalance(
                    consultation.getUser().getId(),
                    remainingAmount,
                    "Consultation with " + consultation.getAstrologer().getName()
            );
        }

        Astrologer astrologer = consultation.getAstrologer();
        BigDecimal additionalEarning = astrologerEarning.subtract(consultation.getAstrologerEarning());
        astrologer.setTotalEarnings(astrologer.getTotalEarnings().add(additionalEarning));
        astrologer.setTotalConsultations(astrologer.getTotalConsultations() == null ? 1 : astrologer.getTotalConsultations() + 1);
        astrologer.setStatus(AstrologerStatus.ONLINE);
        astrologer.setAvailable(true);
        astrologerRepository.save(astrologer);

        consultation.setStatus(ConsultationStatus.COMPLETED);
        consultation.setEndTime(endTime);
        consultation.setDurationMinutes((int) minutes);
        consultation.setTotalAmount(totalAmount);
        consultation.setAstrologerEarning(astrologerEarning);
        consultation.setPlatformCommission(platformCommission);
        consultation = consultationRepository.save(consultation);

        return toConsultationResponse(consultation);
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultationResponseModel getActiveConsultation(Long userId) {
        Consultation consultation = consultationRepository
                .findByUserIdAndStatus(userId, ConsultationStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Active consultation not found"));

        return toConsultationResponse(consultation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConsultationResponseModel> getConsultationHistory(Long userId, Pageable pageable) {
        return consultationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toConsultationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultationResponseModel getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", id));
        return toConsultationResponse(consultation);
    }

    private Consultation loadConsultationForOwnership(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", id));
    }

    @Override
    public void assertParticipant(Long consultationId, String email) {
        Consultation c = loadConsultationForOwnership(consultationId);
        boolean isUser = c.getUser() != null && email.equals(c.getUser().getEmail());
        boolean isAstrologer = c.getAstrologer() != null && email.equals(c.getAstrologer().getEmail());
        if (!isUser && !isAstrologer) {
            throw new UnauthorizedAccessException("You are not a participant of this consultation");
        }
    }

    private ConsultationResponseModel toConsultationResponse(Consultation c) {
        return ConsultationResponseModel.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getName())
                .astrologerId(c.getAstrologer().getId())
                .astrologerName(c.getAstrologer().getName())
                .type(c.getType())
                .status(c.getStatus())
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .durationMinutes(c.getDurationMinutes())
                .totalAmount(c.getTotalAmount())
                .astrologerEarning(c.getAstrologerEarning())
                .platformCommission(c.getPlatformCommission())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
