package com.ggamakun.linkle.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
	private Integer memberId;
    private String email;
    private String name;
    private String nickname;
    private String accessToken;
    private String refreshToken;
}
