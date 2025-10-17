package com.ggamakun.linkle.domain.notification.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.dto.NotificationDto;
import com.ggamakun.linkle.domain.notification.repository.INotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final INotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationDto> getNotifications(Integer memberId) {
        return notificationRepository.findByReceiverId(memberId);
    }

    @Transactional
    public void sendNotification(CreateNotificationRequestDto request) {
        notificationRepository.insertNotification(request);
        
        messagingTemplate.convertAndSendToUser(
            request.getReceiverId().toString(),
            "/queue/notifications",
            NotificationDto.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .linkUrl(request.getLinkUrl())
                .isRead("N")
                .build()
        );
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer memberId) {
        notificationRepository.markAsRead(notificationId, memberId);
    }

    @Transactional
    public void markAllAsRead(Integer memberId) {
        notificationRepository.markAllAsRead(memberId);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer memberId) {
        notificationRepository.deleteNotification(notificationId, memberId);
    }
}