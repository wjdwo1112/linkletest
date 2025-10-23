package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.Data;

@Data
public class ScheduleDetail {
    private Integer scheduleId;
    private Integer clubId;
    private String title;
    private String content;
    private String address;
    private String addressDetail;
    private Double latitude;
    private Double longitude;
    private Timestamp scheduleStartDate;
    private Timestamp scheduleEndDate;
    private Integer maxAttendees;
    private Integer createdBy;
    private Timestamp createdAt;
    private String isCanceled;
    private Timestamp canceledAt;
    private Integer canceledBy;
    private List<AttendeeInfo> attendees;
}