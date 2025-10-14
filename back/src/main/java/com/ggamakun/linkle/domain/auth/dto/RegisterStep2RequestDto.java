package com.ggamakun.linkle.domain.auth.dto;

import java.sql.Timestamp;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 2단계 요청 DTO")
public class RegisterStep2RequestDto {
    
    @NotNull(message = "회원 ID가 필요합니다.")
    @Schema(description = "회원 ID", example = "1")
    private Integer memberId;
    
    @NotBlank(message = "닉네임을 입력해주세요.")
    @Schema(description = "닉네임", example = "길동이")
    private String nickname;
    
    @NotNull(message = "생년월일을 입력해주세요.")
    @Schema(description = "생년월일", example = "1990-01-01 00:00:00")
    private Timestamp birthDate;
    
    @NotBlank(message = "성별을 선택해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F만 가능합니다.")
    @Schema(description = "성별 (M: 남성, F: 여성)", example = "M")
    private String gender;
    
    @NotBlank(message = "시/도를 입력해주세요.")
    @Schema(description = "시/도", example = "서울특별시")
    private String sido;
    
    @NotBlank(message = "시/군/구를 입력해주세요.")
    @Schema(description = "시/군/구", example = "강남구")
    private String sigungu;
}