package com.astrotalk.config;

import com.astrotalk.entity.Astrologer;
import com.astrotalk.entity.Consultation;
import com.astrotalk.entity.User;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.ConsultationRepository;
import com.astrotalk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Inbound STOMP channel interceptor that authorizes SUBSCRIBE frames.
 *
 * Without this, any authenticated (or, if a connection were opened anonymously,
 * even unauthenticated) client could SUBSCRIBE to /topic/consultation/{id} or
 * /topic/user/{id}/... for arbitrary ids and eavesdrop on other people's chats,
 * call signals, and notifications.
 *
 * Rules enforced here:
 *  - /topic/user/{id}/...      -> the subscriber may only subscribe to their OWN id
 *                                 (matched against the account's user or astrologer id).
 *  - /topic/consultation/{id}  -> the subscriber must be the user or astrologer of
 *                                 that consultation.
 *  - any other /topic/...      -> denied (no such destinations are used by the app).
 *  - non-/topic destinations   -> allowed (not currently used by the broker).
 */
@Component
@RequiredArgsConstructor
public class WebSocketSubscriptionInterceptor implements ChannelInterceptor {

    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;
    private final ConsultationRepository consultationRepository;

    private static final String USER_TOPIC_PREFIX = "/topic/user/";
    private static final String CONSULTATION_TOPIC_PREFIX = "/topic/consultation/";

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Only police SUBSCRIBE; CONNECT is handled by JwtHandshakeInterceptor and
        // SEND/DISCONNECT carry no subscription target.
        if (accessor == null || !StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            return message;
        }

        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new AccessDeniedException("Unauthenticated subscription request");
        }

        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith("/topic/")) {
            return message;
        }

        String email = principal.getName();

        if (destination.startsWith(USER_TOPIC_PREFIX)) {
            authorizeUserTopic(destination, email);
        } else if (destination.startsWith(CONSULTATION_TOPIC_PREFIX)) {
            authorizeConsultationTopic(destination, email);
        } else {
            // Deny any unknown /topic destination to avoid future eavesdropping leaks.
            throw new AccessDeniedException("Subscription to " + destination + " is not permitted");
        }

        return message;
    }

    /**
     * /topic/user/{id}[/...] is private to the account whose user or astrologer id is {id}.
     */
    private void authorizeUserTopic(String destination, String email) {
        String remainder = destination.substring(USER_TOPIC_PREFIX.length());
        int slash = remainder.indexOf('/');
        String idPart = slash >= 0 ? remainder.substring(0, slash) : remainder;

        Long requestedId;
        try {
            requestedId = Long.parseLong(idPart);
        } catch (NumberFormatException e) {
            throw new AccessDeniedException("Invalid user topic destination");
        }

        Long userId = userRepository.findByEmail(email).map(User::getId).orElse(null);
        Long astrologerId = astrologerRepository.findByEmail(email).map(Astrologer::getId).orElse(null);

        if (userId == null && astrologerId == null) {
            throw new AccessDeniedException("Unknown subscriber");
        }

        boolean allowed = requestedId.equals(userId) || requestedId.equals(astrologerId);
        if (!allowed) {
            throw new AccessDeniedException("You may only subscribe to your own notifications");
        }
    }

    /**
     * /topic/consultation/{id}[/...] is private to the user and astrologer of that consultation.
     */
    private void authorizeConsultationTopic(String destination, String email) {
        String remainder = destination.substring(CONSULTATION_TOPIC_PREFIX.length());
        int slash = remainder.indexOf('/');
        String idPart = slash >= 0 ? remainder.substring(0, slash) : remainder;

        Long consultationId;
        try {
            consultationId = Long.parseLong(idPart);
        } catch (NumberFormatException e) {
            throw new AccessDeniedException("Invalid consultation topic destination");
        }

        Consultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new AccessDeniedException("Consultation not found"));

        boolean isUser = consultation.getUser() != null
                && email.equals(consultation.getUser().getEmail());
        boolean isAstrologer = consultation.getAstrologer() != null
                && email.equals(consultation.getAstrologer().getEmail());

        if (!isUser && !isAstrologer) {
            throw new AccessDeniedException("You are not a participant of this consultation");
        }
    }
}
