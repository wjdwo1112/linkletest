package com.ggamakun.linkle.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 1단계 요청 DTO")
public class RegisterStep1RequestDto {
    
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Schema(description = "이메일", example = "user@example.com")
    private String email;
    
    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$", 
             message = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.")
    @Schema(description = "비밀번호 (8자 이상, 영문+숫자 포함)", example = "password123")
    private String password;
    
    @NotBlank(message = "이름을 입력해주세요.")
    @Schema(description = "이름", example = "홍길동")
    private String name;
}