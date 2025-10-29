package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuarterlyJoinDto {
    
    private Integer year;
    private Integer quarter;
    private Integer count;
    private String label;
}