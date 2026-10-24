package com.astrotalk.controller;

import com.astrotalk.constant.WebResource;
import com.astrotalk.entity.User;
import com.astrotalk.exception.ResourceNotFoundException;
import com.astrotalk.exception.UnauthorizedAccessException;
import com.astrotalk.model.NotificationResponseModel;
import com.astrotalk.repository.UserRepository;
import com.astrotalk.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for notification management.
 * Provides endpoints for listing, reading, and managing push notifications.
 */
@RestController
@RequestMapping(WebResource.NOTIFICATIONS)
@Validated
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Push notifications and alerts")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * GET /notifications - Returns a paginated list of notifications for the authenticated user.
     *
     * @param authentication the current authenticated user
     * @param page           zero-based page index (default 0)
     * @param size           page size (default 20)
     * @return paginated list of {@link NotificationResponse}
     */
    @GetMapping
    @Operation(summary = "Get notifications", description = "Returns paginated notifications for the user")
    public ResponseEntity<Page<NotificationResponseModel>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(notificationService.getNotifications(user.getId(), PageRequest.of(page, size)));
    }

    /**
     * GET /notifications/unread-count - Returns the number of unread notifications.
     *
     * @param authentication the current authenticated user
     * @return map with key {@code unreadCount}
     */
    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", description = "Returns count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(user.getId())));
    }

    /**
     * GET /notifications/{id} - Returns a notification by its ID.
     *
     * @param id the notification ID
     * @return the {@link NotificationResponse}
     */
    @GetMapping(WebResource.ID_PATH)
    @Operation(summary = "Get notification by ID", description = "Returns a notification by its ID")
    public ResponseEntity<NotificationResponseModel> getNotificationById(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        NotificationResponseModel notification = notificationService.getNotificationById(id);
        if (!user.getId().equals(notification.getUserId())) {
            throw new UnauthorizedAccessException("You do not own this notification");
        }
        return ResponseEntity.ok(notification);
    }

    /**
     * PUT /notifications/{id}/read - Marks a single notification as read.
     *
     * @param id the notification ID
     * @param authentication the current authenticated user
     * @return 200 OK
     */
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a single notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        NotificationResponseModel notification = notificationService.getNotificationById(id);
        if (!user.getId().equals(notification.getUserId())) {
            throw new UnauthorizedAccessException("You do not own this notification");
        }
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /notifications/read-all - Marks all unread notifications as read for the authenticated user.
     *
     * @param authentication the current authenticated user
     * @return 200 OK
     */
    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Marks all unread notifications as read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
