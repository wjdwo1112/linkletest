package com.ggamakun.linkle.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원 탈퇴 요청 DTO")
public class WithdrawAccountRequestDto {
    
    @Schema(description = "비밀번호 (일반 회원만 필요)", example = "password123")
    private String password;
}