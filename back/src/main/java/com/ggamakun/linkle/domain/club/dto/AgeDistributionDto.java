package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgeDistributionDto {
    
    private String ageGroup;
    private Integer count;
}