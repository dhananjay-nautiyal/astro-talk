package com.astrotalk.repository;

import com.astrotalk.entity.Consultation;
import com.astrotalk.entity.ConsultationStatus;
import com.astrotalk.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByStatus(ConsultationStatus status);

    Page<Consultation> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Consultation> findByAstrologerIdAndStatus(Long astrologerId, ConsultationStatus status);

    Optional<Consultation> findByUserIdAndStatus(Long userId, ConsultationStatus status);

    long countByStatus(ConsultationStatus status);

    /**
     * Existence checks that resolve the lazy user/astrologer associations in SQL.
     * Safe to call outside a Hibernate session (open-in-view is disabled) because
     * no entity proxies are initialized - used by the authorization checks.
     */
    boolean existsByIdAndUser_Email(Long id, String email);

    boolean existsByIdAndAstrologer_Email(Long id, String email);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Consultation c WHERE c.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(c.totalAmount), 0) FROM Consultation c WHERE c.status = 'COMPLETED' AND c.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
