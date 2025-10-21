package com.ggamakun.linkle.domain.schedule.dto;

import java.sql.Timestamp;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "일정 참석자 정보 DTO")
public class AttendeeInfo {
    
    @Schema(description = "회원 ID", example = "1")
    private Integer memberId;
    
    @Schema(description = "회원 닉네임", example = "홍길동")
    private String nickname;
    
    @Schema(description = "프로필 이미지 URL", example = "https://...")
    private String profileImageUrl;
    
    @Schema(description = "참석 상태", example = "ATTEND")
    private String attendanceStatus;
    
    @Schema(description = "응답 일시", example = "2025-09-02 14:30:00")
    private Timestamp respondedAt;
}