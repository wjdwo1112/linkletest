package com.ggamakun.linkle.domain.notification.entity;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Integer notificationId;
    private String title;
    private String content;
    private Integer createdBy;
    private Date createdAt;
    private Integer updatedBy;
    private Date updatedAt;
    private Integer receiverId;
    private String linkUrl;
    private String isRead;
    private Date readAt;
    private Date sentAt;
    private String isDeleted;
}