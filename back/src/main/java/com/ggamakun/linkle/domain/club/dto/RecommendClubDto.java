package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendClubDto {
    private Integer clubId;
    private String clubName;
    private String description;
    private String fileLink;
    private String categoryName;
    private String region;
    private Integer memberCount;
    private String openedAt;
}