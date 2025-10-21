package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "일정 상세 조회 DTO")
public class ScheduleDetail {
    
    @Schema(description = "일정 ID", example = "1")
    private Integer scheduleId;
    
    @Schema(description = "동호회 ID", example = "1")
    private Integer clubId;
    
    @Schema(description = "일정 제목", example = "9월 정기 모임")
    private String title;
    
    @Schema(description = "일정 내용", example = "9월 정기 모임입니다.")
    private String content;
    
    @Schema(description = "주소", example = "서울특별시 강남구")
    private String address;
    
    @Schema(description = "상세 주소", example = "테헤란로 123")
    private String addressDetail;
    
    @Schema(description = "위도", example = "37.5665")
    private Double latitude;
    
    @Schema(description = "경도", example = "126.9780")
    private Double longitude;
    
    @Schema(description = "일정 시작 일시", example = "2025-09-17 18:30:00")
    private Timestamp scheduleStartDate;
    
    @Schema(description = "일정 종료 일시", example = "2025-09-17 20:30:00")
    private Timestamp scheduleEndDate;
    
    @Schema(description = "최대 참석 인원", example = "20")
    private Integer maxAttendees;
    
    @Schema(description = "작성자 ID", example = "1")
    private Integer createdBy;
    
    @Schema(description = "작성 일시", example = "2025-09-01 10:00:00")
    private Timestamp createdAt;
    
    @Schema(description = "취소 여부", example = "N")
    private String isCanceled;
    
    @Schema(description = "취소 일시", example = "2025-09-16 10:00:00")
    private Timestamp canceledAt;
    
    @Schema(description = "취소자 ID", example = "1")
    private Integer canceledBy;
    
    @Schema(description = "참석자 목록")
    private List<AttendeeInfo> attendees;
}