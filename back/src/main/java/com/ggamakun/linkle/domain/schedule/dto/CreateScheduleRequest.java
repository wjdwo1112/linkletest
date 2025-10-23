package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateScheduleRequest {
    
    @NotNull(message = "동호회 ID는 필수입니다.")
    private Integer clubId;
    @NotBlank(message = "제목은 필수입니다.")
    private String title;
    private String content;
    private String address;
    private String addressDetail;
    private Double latitude;
    private Double longitude;
    @NotNull(message = "시작 일시는 필수입니다.")
    private Timestamp scheduleStartDate;
    @NotNull(message = "종료 일시는 필수입니다.")
    private Timestamp scheduleEndDate;
    private Integer maxAttendees;
    private Integer createdBy;
}