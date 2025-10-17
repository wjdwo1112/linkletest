package com.ggamakun.linkle.domain.member.dto;

import java.sql.Timestamp;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "회원 프로필 응답 DTO")
public class MemberProfileDto {
    
    @Schema(description = "회원 ID", example = "1")
    private Integer memberId;
    
    @Schema(description = "프로필 이미지 ID", example = "1")
    private Integer fileId;
    
    @Schema(description = "이메일", example = "user@example.com")
    private String email;
    
    @Schema(description = "이름", example = "홍길동")
    private String name;
    
    @Schema(description = "닉네임", example = "오정재")
    private String nickname;
    
    @Schema(description = "생년월일", example = "1990-01-01")
    private Timestamp birthDate;
    
    @Schema(description = "성별", example = "M")
    private String gender;
    
    @Schema(description = "시도", example = "서울특별시")
    private String sido;
    
    @Schema(description = "시군구", example = "강남구")
    private String sigungu;
    
    @Schema(description = "자기소개", example = "자기소개입니다.")
    private String description;
    
    @Schema(description = "관심사 카테고리 ID 목록", example = "[14, 15, 20]")
    private List<Integer> interests;
    
    @Schema(description = "관심사 카테고리 이름 목록", example = "[\"축구\", \"야구\", \"농구\"]")
    private List<String> interestNames;
    
    @Schema(description = "가입일", example = "2024-01-01")
    private Timestamp joinDate;
}