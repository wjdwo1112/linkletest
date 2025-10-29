package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchClubDto {
    private Integer clubId;
    private String clubName;
    private String description;
    private String region;
    private String categoryName;
    private String leaderNickname;
    private String fileLink;
    private Integer currentMembers;
    private Integer maxMembers;
}