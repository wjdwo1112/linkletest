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
@Schema(description = "아이디 찾기 응답 DTO")
public class FindIdResponseDto {
    
    @Schema(description = "이메일", example = "user@example.com")
    private String email;
}