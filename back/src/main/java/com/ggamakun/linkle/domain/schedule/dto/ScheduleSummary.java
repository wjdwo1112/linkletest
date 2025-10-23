package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class ScheduleSummary {
    private Integer scheduleId;
    private Integer clubId;
    private String title;
    private String address;
    private Timestamp scheduleStartDate;
    private Timestamp scheduleEndDate;
    private Integer maxAttendees;
    private String isCanceled;
    private Integer attendeeCount;
}