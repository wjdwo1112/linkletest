package com.ggamakun.linkle.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "이메일 인증 응답 DTO")
public class VerifyEmailResponseDto {
    
    @Schema(description = "응답 메시지", example = "이메일 인증이 완료되었습니다.")
    private String message;
}