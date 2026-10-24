package com.astrotalk.controller;

import com.astrotalk.entity.Astrologer;
import com.astrotalk.entity.Consultation;
import com.astrotalk.entity.ConsultationStatus;
import com.astrotalk.entity.User;
import com.astrotalk.exception.UnauthorizedAccessException;
import com.astrotalk.model.CallInviteModel;
import com.astrotalk.model.SignalModel;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.ConsultationRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket controller for WebRTC call signaling between users and astrologers.
 * Handles invite, accept, reject, offer, answer, ICE candidate, and end-call events.
 *
 * Every handler authenticates the STOMP principal and verifies that the sender is
 * a participant (user or astrologer) of the target consultation before acting, so an
 * anonymous or unrelated client cannot hijack or end someone else's call.
 */
@Controller
@RequiredArgsConstructor
public class CallSignalingController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final ConsultationService consultationService;
    private final ConsultationRepository consultationRepository;
    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;

    /**
     * Handles /call.invite - Sends a call invitation to an astrologer for an active consultation.
     * Only the consultation's user may invite.
     *
     * @param invite        the call invite details (consultation ID, caller info)
     * @param headerAccessor used to extract the authenticated principal
     */
    @MessageMapping("/call.invite")
    public void invite(@Payload CallInviteModel invite, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = requirePrincipal(headerAccessor);
        Consultation consultation = loadActiveConsultation(invite.getConsultationId());
        requireParticipant(consultation, principal);

        Long astrologerId = consultation.getAstrologer().getId();
        messagingTemplate.convertAndSend("/topic/user/" + astrologerId + "/call", invite);
    }

    /**
     * Handles /call.accept - Forwards an accept signal to the consultation topic.
     */
    @MessageMapping("/call.accept")
    public void accept(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        forwardIfParticipant(signal, headerAccessor);
    }

    /**
     * Handles /call.reject - Forwards a reject signal to the consultation topic.
     */
    @MessageMapping("/call.reject")
    public void reject(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        forwardIfParticipant(signal, headerAccessor);
    }

    /**
     * Handles /call.offer - Forwards a WebRTC SDP offer to the consultation topic.
     */
    @MessageMapping("/call.offer")
    public void offer(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        forwardIfParticipant(signal, headerAccessor);
    }

    /**
     * Handles /call.answer - Forwards a WebRTC SDP answer to the consultation topic.
     */
    @MessageMapping("/call.answer")
    public void answer(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        forwardIfParticipant(signal, headerAccessor);
    }

    /**
     * Handles /call.ice - Forwards an ICE candidate to the consultation topic for NAT traversal.
     */
    @MessageMapping("/call.ice")
    public void ice(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        forwardIfParticipant(signal, headerAccessor);
    }

    /**
     * Handles /call.end - Ends an active consultation and notifies participants.
     * Only a participant may end the consultation.
     *
     * @param signal the signal payload containing the consultation ID to end
     */
    @MessageMapping("/call.end")
    public void endCall(@Payload SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = requirePrincipal(headerAccessor);
        Consultation consultation = loadActiveConsultation(signal.getConsultationId());
        requireParticipant(consultation, principal);

        consultationService.endConsultation(signal.getConsultationId());
        messagingTemplate.convertAndSend(
                "/topic/consultation/" + signal.getConsultationId() + "/signal",
                signal);
    }

    /**
     * Verifies the sender participates in the consultation and, if so, forwards the
     * signal to the consultation topic.
     */
    private void forwardIfParticipant(SignalModel signal, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = requirePrincipal(headerAccessor);
        Consultation consultation = loadConsultation(signal.getConsultationId());
        requireParticipant(consultation, principal);

        messagingTemplate.convertAndSend(
                "/topic/consultation/" + signal.getConsultationId() + "/signal",
                signal);
    }

    private Principal requirePrincipal(SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) {
            throw new UnauthorizedAccessException("Unauthenticated WebSocket request");
        }
        return principal;
    }

    private Consultation loadActiveConsultation(Long consultationId) {
        Consultation consultation = loadConsultation(consultationId);
        if (consultation.getStatus() != ConsultationStatus.ACTIVE) {
            throw new UnauthorizedAccessException("Consultation is not active");
        }
        return consultation;
    }

    private Consultation loadConsultation(Long consultationId) {
        return consultationRepository.findById(consultationId)
                .orElseThrow(() -> new UnauthorizedAccessException("Consultation not found"));
    }

    /**
     * Ensures the authenticated principal is the user or the astrologer of the consultation.
     * The WebSocket principal's name is the account email.
     */
    private void requireParticipant(Consultation consultation, Principal principal) {
        String email = principal.getName();
        User user = consultation.getUser();
        Astrologer astrologer = consultation.getAstrologer();

        boolean isUser = user != null && email.equals(user.getEmail());
        boolean isAstrologer = astrologer != null && email.equals(astrologer.getEmail());

        if (!isUser && !isAstrologer) {
            // Fall back to a lookup in case the entity associations were not populated.
            boolean matchesAccount = userRepository.findByEmail(email)
                    .map(u -> u.getId().equals(user != null ? user.getId() : null))
                    .orElse(false)
                    || astrologerRepository.findByEmail(email)
                    .map(a -> a.getId().equals(astrologer != null ? astrologer.getId() : null))
                    .orElse(false);
            if (!matchesAccount) {
                throw new UnauthorizedAccessException("You are not a participant of this consultation");
            }
        }
    }
}
