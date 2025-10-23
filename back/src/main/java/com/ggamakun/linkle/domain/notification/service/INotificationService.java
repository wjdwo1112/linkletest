package com.ggamakun.linkle.domain.notification.service;

import java.util.List;

import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.dto.NotificationDto;

public interface INotificationService {
	//특정 회원의 알림 목록 조회
    List<NotificationDto> getNotifications(Integer memberId);

    
    //알림 생성 및 실시간 발송
     void sendNotification(CreateNotificationRequestDto request);

    
    //단일 알림 읽음 처리
    void markAsRead(Integer notificationId, Integer memberId);

    
    //모든 알림 읽음 처리
    void markAllAsRead(Integer memberId);

    
    //단일 알림 삭제
    void deleteNotification(Integer notificationId, Integer memberId);
}
