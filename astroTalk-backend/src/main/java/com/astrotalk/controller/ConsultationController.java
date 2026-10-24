package com.astrotalk.controller;

import com.astrotalk.constant.WebResource;
import com.astrotalk.entity.User;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.model.ConsultationResponseModel;
import com.astrotalk.model.StartConsultationRequestModel;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for consultation lifecycle management.
 * Handles starting, ending, and retrieving active/past consultations.
 */
@RestController
@RequestMapping(WebResource.CONSULTATIONS)
@Validated
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Start, end, and manage consultations")
public class ConsultationController {

    private final ConsultationService consultationService;
    private final UserRepository userRepository;

    /**
     * POST /consultations/start - Initiates a consultation with an astrologer after wallet balance check.
     *
     * @param authentication the current authenticated user
     * @param request        the consultation start details (astrologer ID, type)
     * @return the created {@link ConsultationResponse}
     */
    @PostMapping(WebResource.START)
    @Operation(summary = "Start a consultation", description = "Initiates a consultation with an astrologer after wallet check")
    public ResponseEntity<ConsultationResponseModel> startConsultation(
            Authentication authentication,
            @Valid @RequestBody StartConsultationRequestModel request) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(consultationService.startConsultation(user.getId(), request));
    }

    /**
     * POST /consultations/{id}/end - Completes an active consultation and processes final billing.
     *
     * @param id the consultation ID to end
     * @return the completed {@link ConsultationResponse}
     */
    @PostMapping(WebResource.END)
    @Operation(summary = "End a consultation", description = "Completes an active consultation and processes final billing")
    public ResponseEntity<ConsultationResponseModel> endConsultation(
            @PathVariable Long id,
            Authentication authentication) {
        consultationService.assertParticipant(id, authentication.getName());
        return ResponseEntity.ok(consultationService.endConsultation(id));
    }

    /**
     * GET /consultations/active - Returns the currently active consultation for the authenticated user.
     *
     * @param authentication the current authenticated user
     * @return the active {@link ConsultationResponse} or an error if none exists
     */
    @GetMapping(WebResource.ACTIVE)
    @Operation(summary = "Get active consultation", description = "Returns the currently active consultation for the user")
    public ResponseEntity<ConsultationResponseModel> getActiveConsultation(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(consultationService.getActiveConsultation(user.getId()));
    }

    /**
     * GET /consultations/history - Returns paginated consultation history for the authenticated user.
     *
     * @param authentication the current authenticated user
     * @param page           zero-based page index (default 0)
     * @param size           page size (default 10)
     * @return paginated list of {@link ConsultationResponse}
     */
    @GetMapping(WebResource.HISTORY)
    @Operation(summary = "Get consultation history", description = "Returns paginated consultation history for the user")
    public ResponseEntity<Page<ConsultationResponseModel>> getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(consultationService.getConsultationHistory(user.getId(), PageRequest.of(page, size)));
    }

    /**
     * GET /consultations/{id} - Returns a consultation by its ID.
     *
     * @param id the consultation ID
     * @return the {@link ConsultationResponse}
     */
    @GetMapping(WebResource.ID_PATH)
    @Operation(summary = "Get consultation by ID", description = "Returns a consultation by its ID")
    public ResponseEntity<ConsultationResponseModel> getConsultationById(
            @Parameter(description = "Consultation ID", required = true, in = ParameterIn.PATH)
            @PathVariable Long id,
            Authentication authentication) {
        consultationService.assertParticipant(id, authentication.getName());
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
