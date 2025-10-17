package com.ggamakun.linkle.domain.notification.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.dto.NotificationDto;

@Mapper
public interface INotificationRepository {
    
    List<NotificationDto> findByReceiverId(Integer receiverId);
    
    int insertNotification(CreateNotificationRequestDto request);
    
    int markAsRead(@Param("notificationId") Integer notificationId, @Param("memberId") Integer memberId);
    
    int markAllAsRead(Integer memberId);
    
    int deleteNotification(@Param("notificationId") Integer notificationId, @Param("memberId") Integer memberId);
}