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
public class ScheduleAttendance {
    private Integer scheduleId;
    private Integer memberId;
    private String attendanceStatus;
    private Timestamp respondedAt;
    private Integer createdBy;
    private Timestamp createdAt;
    private Integer updatedBy;
    private Timestamp updatedAt;
    private String isDeleted;
}