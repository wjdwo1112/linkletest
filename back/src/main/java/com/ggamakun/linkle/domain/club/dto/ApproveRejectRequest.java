package com.ggamakun.linkle.domain.club.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveRejectRequest {
    @NotNull(message = "동호회 ID는 필수입니다.")
    private Integer clubId;
    
    @NotNull(message = "회원 ID는 필수입니다.")
    private Integer memberId;
    
    private String rejectionReason;
}