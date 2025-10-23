package com.ggamakun.linkle.domain.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.notification.dto.NotificationDto;
import com.ggamakun.linkle.domain.notification.service.NotificationService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
@Tag(name = "알림", description = "알림 관련 API")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        return ResponseEntity.ok(notificationService.getNotifications(memberId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("notificationId") Integer notificationId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        notificationService.markAsRead(notificationId, memberId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        notificationService.markAllAsRead(memberId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable("notificationId") Integer notificationId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        notificationService.deleteNotification(notificationId, memberId);
        return ResponseEntity.noContent().build();
    }
}