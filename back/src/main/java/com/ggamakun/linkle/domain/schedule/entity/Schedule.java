package com.ggamakun.linkle.domain.schedule.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {
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
    private Integer updatedBy;
    private Timestamp updatedAt;
    private String isCanceled;
    private Timestamp canceledAt;
    private Integer canceledBy;
    private String isDeleted;
}