package com.ggamakun.linkle.domain.auth.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "회원가입 3단계 요청 DTO")
public class RegisterStep3RequestDto {
    
    @NotNull(message = "회원 ID가 필요합니다.")
    @Schema(description = "회원 ID", example = "1")
    private Integer memberId;
    
    @NotEmpty(message = "관심사를 최소 3개 선택해주세요.")
    @Size(min = 3, max = 5, message = "관심사는 최소 3개, 최대 5개까지 선택 가능합니다.")
    @Schema(description = "관심사 카테고리 ID 목록", example = "[1, 5, 10]")
    private List<Integer> interests;
}