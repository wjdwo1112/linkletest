package com.ggamakun.linkle.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
	private Integer memberId;
    private String email;
    private String name;
    private String nickname;
    private Integer fileId;
    private String accessToken;
    private String refreshToken;
    private String message;
}
