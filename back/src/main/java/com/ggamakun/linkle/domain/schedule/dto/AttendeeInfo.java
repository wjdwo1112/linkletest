package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class AttendeeInfo {
    private Integer memberId;
    private String nickname;
    private String profileImageUrl;
    private String attendanceStatus;
    private Timestamp respondedAt;
}