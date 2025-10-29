package com.ggamakun.linkle.domain.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBasicInfoRequestDto {
    
    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하여야 합니다.")
    private String nickname;
    @NotBlank(message = "주소는 필수입니다.")
    private String sido;
    @NotBlank(message = "주소는 필수입니다.")
    private String sigungu;
    private String description;
    private Integer fileId;
}