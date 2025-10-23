package com.ggamakun.linkle.domain.member.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberProfileDto {
    
    private Integer memberId;
    private Integer fileId;
//    private String profileImageUrl;
    private String email;
    private String name;
    private String nickname;
    private Timestamp birthDate;
    private String gender;
    private String sido;
    private String sigungu;
    private String description;
    private List<Integer> interests;
    private List<String> interestNames;
    private Timestamp joinDate;
}