package com.astrotalk.controller;

import com.astrotalk.entity.Consultation;
import com.astrotalk.entity.SenderRole;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.exception.UnauthorizedAccessException;
import com.astrotalk.model.MessageRequestModel;
import com.astrotalk.model.MessageResponseModel;
import com.astrotalk.model.TypingIndicatorModel;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.ConsultationRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket controller for real-time chat messaging.
 * Handles sending messages, read receipts, and typing indicators via STOMP.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;
    private final ConsultationRepository consultationRepository;

    /**
     * Handles /chat.send - Persists and broadcasts a chat message to the consultation topic.
     *
     * @param request       the message payload (consultation ID, content, type)
     * @param headerAccessor used to extract the authenticated sender principal
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequestModel request, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        Sender sender = resolveSender(principal.getName()).orElse(null);
        if (sender == null) return;

        requireParticipant(request.getConsultationId(), sender);
        handleSend(request, sender.id(), sender.role());
    }

    private void handleSend(MessageRequestModel request, Long senderId, SenderRole senderRole) {
        MessageResponseModel response = chatService.sendMessage(
                request.getConsultationId(),
                senderId,
                senderRole,
                request.getContent(),
                request.getMessageType()
        );

        messagingTemplate.convertAndSend(
                "/topic/consultation/" + request.getConsultationId(),
                response
        );
    }

    /**
     * Handles /chat.read - Marks messages as read and broadcasts a read receipt.
     *
     * @param request       the message payload containing the consultation ID
     * @param headerAccessor used to extract the authenticated principal
     */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload MessageRequestModel request, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        Sender sender = resolveSender(principal.getName()).orElse(null);
        if (sender == null) return;

        requireParticipant(request.getConsultationId(), sender);
        chatService.markAsRead(request.getConsultationId(), sender.role());

        messagingTemplate.convertAndSend(
                "/topic/consultation/" + request.getConsultationId() + "/read",
                request.getConsultationId()
        );
    }

    /**
     * Handles /chat.typing - Broadcasts a typing indicator to the consultation topic.
     *
     * @param indicator     the typing indicator payload (consultation ID, sender info)
     * @param headerAccessor used to extract the authenticated principal
     */
    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingIndicatorModel indicator, SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        Sender sender = resolveSender(principal.getName()).orElse(null);
        if (sender == null) return;

        requireParticipant(indicator.getConsultationId(), sender);
        indicator.setSenderId(sender.id());
        indicator.setSenderRole(sender.role());

        messagingTemplate.convertAndSend(
                "/topic/consultation/" + indicator.getConsultationId() + "/typing",
                indicator
        );
    }

    /**
     * The authenticated sender of a chat frame (account id + role resolved from the principal).
     */
    private record Sender(Long id, SenderRole role) {
    }

    /**
     * Resolves the principal's account as either a user or an astrologer.
     */
    private java.util.Optional<Sender> resolveSender(String email) {
        return userRepository.findByEmail(email)
                .map(u -> new Sender(u.getId(), SenderRole.USER))
                .or(() -> astrologerRepository.findByEmail(email)
                        .map(a -> new Sender(a.getId(), SenderRole.ASTROLOGER)));
    }

    /**
     * Verifies that the sender participates in the consultation before the frame is
     * processed or broadcast (issue #53 - prevents message injection / read receipts /
     * typing indicators in consultations the sender does not belong to).
     *
     * <p>Only the lazy proxies' identifiers are read (never a mapped attribute such as
     * {@code email}), so no Hibernate session is required - identifiers are carried on
     * the proxy itself and this stays safe with {@code open-in-view: false}.</p>
     */
    private void requireParticipant(Long consultationId, Sender sender) {
        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", consultationId));

        Long participantId = sender.role() == SenderRole.USER
                ? (consultation.getUser() != null ? consultation.getUser().getId() : null)
                : (consultation.getAstrologer() != null ? consultation.getAstrologer().getId() : null);

        if (!sender.id().equals(participantId)) {
            throw new UnauthorizedAccessException("You are not a participant of this consultation");
        }
    }
}
