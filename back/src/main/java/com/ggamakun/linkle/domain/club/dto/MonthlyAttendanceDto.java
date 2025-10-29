package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyAttendanceDto {
    
    private Integer memberId;
    private String nickname;
    private String profileImageUrl;
    private Double avgAttendanceRate;
}