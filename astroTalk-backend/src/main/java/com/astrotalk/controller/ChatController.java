package com.astrotalk.controller;

import com.astrotalk.constant.WebResource;
import com.astrotalk.entity.Astrologer;
import com.astrotalk.entity.SenderRole;
import com.astrotalk.entity.User;
import com.astrotalk.model.ChatHistoryResponseModel;
import com.astrotalk.repository.AstrologerRepository;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.ChatService;
import com.astrotalk.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for chat history retrieval and read-receipt operations.
 * Complements the WebSocket chat functionality with HTTP endpoints.
 */
@RestController
@RequestMapping(WebResource.CHAT)
@Validated
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time chat and messaging")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final AstrologerRepository astrologerRepository;
    private final ConsultationService consultationService;

    /**
     * GET /chat/{consultationId}/messages - Returns paginated message history for a consultation.
     *
     * @param consultationId the consultation ID
     * @param page           zero-based page index (default 0)
     * @param size           page size (default 20)
     * @return {@link ChatHistoryResponse} with messages and pagination metadata
     */
    @GetMapping(WebResource.MESSAGES)
    @Operation(summary = "Get chat messages", description = "Returns paginated message history for a consultation")
    public ResponseEntity<ChatHistoryResponseModel> getMessages(
            @PathVariable Long consultationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        consultationService.assertParticipant(consultationId, authentication.getName());
        return ResponseEntity.ok(chatService.getMessageHistory(consultationId, page, size));
    }

    /**
     * POST /chat/{consultationId}/read - Marks all unread messages as read for the authenticated user.
     *
     * @param consultationId the consultation ID
     * @param authentication the current authenticated principal
     * @return 200 OK
     */
    @PostMapping(WebResource.READ)
    @Operation(summary = "Mark messages as read", description = "Marks all unread messages as read for the current user")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long consultationId,
            Authentication authentication) {
        consultationService.assertParticipant(consultationId, authentication.getName());
        SenderRole role = resolveRole(authentication.getName());
        if (role != null) {
            chatService.markAsRead(consultationId, role);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * GET /chat/{consultationId}/unread-count - Returns the unread message count for a consultation.
     *
     * @param consultationId the consultation ID
     * @param authentication the current authenticated principal
     * @return map with key {@code unreadCount}
     */
    @GetMapping(WebResource.UNREAD_COUNT)
    @Operation(summary = "Get unread message count", description = "Returns unread message count for a consultation")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long consultationId,
            Authentication authentication) {
        consultationService.assertParticipant(consultationId, authentication.getName());
        SenderRole role = resolveRole(authentication.getName());
        long count = role != null ? chatService.getUnreadCount(consultationId, role) : 0;
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    private SenderRole resolveRole(String email) {
        if (userRepository.findByEmail(email).isPresent()) return SenderRole.USER;
        if (astrologerRepository.findByEmail(email).isPresent()) return SenderRole.ASTROLOGER;
        return null;
    }
}
