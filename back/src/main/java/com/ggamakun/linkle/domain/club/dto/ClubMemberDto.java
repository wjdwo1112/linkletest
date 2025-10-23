package com.ggamakun.linkle.domain.club.dto;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubMemberDto {
    private Integer clubId;
    private Integer memberId;
    private String name;
    private String nickname;
    private String description;
    private String fileLink;
    private String role;
    private String status;
    private Timestamp joinedAt;
    private String rejectionReason;
}
