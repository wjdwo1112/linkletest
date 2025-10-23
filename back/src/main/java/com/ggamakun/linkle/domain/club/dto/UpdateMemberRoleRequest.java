package com.ggamakun.linkle.domain.club.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateMemberRoleRequest {
    @NotNull(message = "동호회 ID는 필수입니다.")
    private Integer clubId;
    
    @NotNull(message = "회원 ID는 필수입니다.")
    private Integer memberId;
    
    @NotNull(message = "역할은 필수입니다.")
    @Pattern(regexp = "MEMBER|MANAGER", message = "역할은 MEMBER 또는 MANAGER만 가능합니다.")
    private String role;
}