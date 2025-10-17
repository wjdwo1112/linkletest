package com.ggamakun.linkle.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequestDto {
    private String title;
    private String content;
    private Integer receiverId;
    private String linkUrl;
    private Integer createdBy;
}