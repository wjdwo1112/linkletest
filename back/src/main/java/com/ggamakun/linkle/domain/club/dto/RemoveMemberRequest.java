package com.ggamakun.linkle.domain.club.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RemoveMemberRequest {
    @NotNull(message = "동호회 ID는 필수입니다.")
    private Integer clubId;
    
    @NotNull(message = "회원 ID는 필수입니다.")
    private Integer memberId;
    
    @NotBlank(message = "사유는 필수입니다.")
    private String reason;
    
    @NotNull(message = "재가입 허용 여부는 필수입니다.")
    private Boolean allowRejoin;
}