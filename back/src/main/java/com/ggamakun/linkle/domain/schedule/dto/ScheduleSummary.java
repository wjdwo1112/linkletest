package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "일정 목록 조회 DTO")
public class ScheduleSummary {
    
    @Schema(description = "일정 ID", example = "1")
    private Integer scheduleId;
    
    @Schema(description = "동호회 ID", example = "1")
    private Integer clubId;
    
    @Schema(description = "일정 제목", example = "9월 정기 모임")
    private String title;
    
    @Schema(description = "주소", example = "서울특별시 강남구")
    private String address;
    
    @Schema(description = "일정 시작 일시", example = "2025-09-17 18:30:00")
    private Timestamp scheduleStartDate;
    
    @Schema(description = "일정 종료 일시", example = "2025-09-17 20:30:00")
    private Timestamp scheduleEndDate;
    
    @Schema(description = "최대 참석 인원", example = "20")
    private Integer maxAttendees;
    
    @Schema(description = "취소 여부", example = "N")
    private String isCanceled;
    
    @Schema(description = "현재 참석자 수", example = "5")
    private Integer attendeeCount;
}