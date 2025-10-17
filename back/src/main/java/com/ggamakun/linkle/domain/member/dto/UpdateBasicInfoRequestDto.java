package com.ggamakun.linkle.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "기본 정보 수정 요청 DTO")
public class UpdateBasicInfoRequestDto {
    
    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하여야 합니다.")
    @Schema(description = "닉네임", example = "회원1")
    private String nickname;
    
    @NotBlank(message = "주소는 필수입니다.")
    @Schema(description = "시/도", example = "서울시")
    private String sido;
    
    @NotBlank(message = "주소는 필수입니다.")
    @Schema(description = "시/군/구", example = "종로구")
    private String sigungu;
    
    @Schema(description = "소개", example = "소개입니다.")
    private String description;
}