package com.ggamakun.linkle.domain.member.entity;


import java.sql.Timestamp;

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
    //private String profileImageUrl;
    private String email;
    private String password;
    private String name;
    private String nickname;
    private Timestamp birthDate;
    private String gender;
    private String sido;
    private String sigungu;
    private String description;
    private String interests;
    private Timestamp joinDate;
    private String isWithdrawn;
    private Timestamp leaveDate;
    private Integer createdBy;
    private Timestamp createdAt;
    private Integer updatedBy;
    private Timestamp updatedAt;
    private String provider;
    private String providerId;
    private String isDeleted;
    private String emailVerified;
    private String verificationToken;
    private Timestamp tokenExpiryDate;
    
    public boolean isSocialUser() {
        return provider != null && !provider.equals("LOCAL");
    }
    
    public boolean isLocalUser() {
        return provider == null || provider.equals("LOCAL");
    }
}