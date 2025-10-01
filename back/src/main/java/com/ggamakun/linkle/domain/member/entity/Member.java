package com.ggamakun.linkle.domain.member.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    
    private Long memberId;
    private Long fileId;
    private String email;
    private String password;
    private String name;
    private String nickname;
    private LocalDate birthDate;
    private String gender;
    private String sido;
    private String sigungu;
    private String description;
    private String interests;
    private LocalDate joinDate;
    private String isWithdrawn;
    private LocalDate leaveDate;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
    private String isDeleted;
}