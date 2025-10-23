package com.ggamakun.linkle.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequestDto {
    @NotBlank(message = "토큰을 입력해주세요.")
    private String token;
    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$", 
             message = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.")
    private String newPassword;
}