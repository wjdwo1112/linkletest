package com.ggamakun.linkle.domain.member.entity;


import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    
    private Integer memberId;
    private Integer fileId;
    private String email;
    private String password;
    private String name;
    private String nickname;
    private Date birthDate;
    private String gender;
    private String sido;
    private String sigungu;
    private String description;
    private String interests;
    private Date joinDate;
    private String isWithdrawn;
    private Date leaveDate;
    private Integer createdBy;
    private Date createdAt;
    private Integer updatedBy;
    private Date updatedAt;
    private String provider;
    private String providerId;
    private String isDeleted;
    
    public boolean isSocialUser() {
        return provider != null && !provider.equals("LOCAL");
    }
    
    public boolean isLocalUser() {
        return provider == null || provider.equals("LOCAL");
    }
}