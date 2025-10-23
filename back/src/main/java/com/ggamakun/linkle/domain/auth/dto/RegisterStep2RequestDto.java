package com.ggamakun.linkle.domain.auth.dto;

import java.sql.Timestamp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterStep2RequestDto {
    @NotNull(message = "회원 ID가 필요합니다.")
    private Integer memberId;
    @NotBlank(message = "닉네임을 입력해주세요.")
    private String nickname;
    @NotNull(message = "생년월일을 입력해주세요.")
    private Timestamp birthDate;
    @NotBlank(message = "성별을 선택해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F만 가능합니다.")
    private String gender;
    @NotBlank(message = "시/도를 입력해주세요.")
    private String sido;
    @NotBlank(message = "시/군/구를 입력해주세요.")
    private String sigungu;
}