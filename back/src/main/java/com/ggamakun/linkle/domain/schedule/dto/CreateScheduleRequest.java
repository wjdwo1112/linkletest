package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "일정 생성 요청 DTO")
public class CreateScheduleRequest {
    
    @NotNull(message = "동호회 ID는 필수입니다.")
    @Schema(description = "동호회 ID", example = "1")
    private Integer clubId;
    
    @NotBlank(message = "제목은 필수입니다.")
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
    
    @NotNull(message = "시작 일시는 필수입니다.")
    @Schema(description = "일정 시작 일시", example = "2025-09-17 18:30:00")
    private Timestamp scheduleStartDate;
    
    @NotNull(message = "종료 일시는 필수입니다.")
    @Schema(description = "일정 종료 일시", example = "2025-09-17 20:30:00")
    private Timestamp scheduleEndDate;
    
    @Schema(description = "최대 참석 인원", example = "20")
    private Integer maxAttendees;
    
    private Integer createdBy;
}