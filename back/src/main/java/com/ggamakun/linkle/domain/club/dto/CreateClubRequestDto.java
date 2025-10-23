package com.ggamakun.linkle.domain.club.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateClubRequestDto {
	
    private Integer clubId;
    
    @NotBlank(message = "동호회 이름을 입력해주세요.")
    @Size(max = 30, message = "동호회 이름은 30자 이내로 입력해주세요.")
    private String name;
    
    @NotNull(message = "관심사를 선택해주세요.")
    private Integer categoryId;
    
    @NotBlank(message = "지역을 선택해주세요.")
    private String sido;
    
    @NotBlank(message = "지역을 선택해주세요.")
    private String sigungu;
    
    @Size(max = 300, message = "동호회 설명은 300자 이내로 입력해주세요.")
    private String description;
    
    @NotNull(message = "모집 정원을 입력해주세요.")
    @Min(value = 2, message = "최소 2명 이상이어야 합니다.")
    @Max(value = 999, message = "최대 999명까지 가능합니다.")
    private Integer maxMembers;
    
    private Integer fileId;
    
    private Integer createdBy;
}