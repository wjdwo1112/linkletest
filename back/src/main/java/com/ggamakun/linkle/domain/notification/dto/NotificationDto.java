package com.ggamakun.linkle.domain.notification.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Integer notificationId;
    private String title;
    private String content;
    private String linkUrl;
    private String isRead;
    private Date sentAt;
    private Date readAt;
}