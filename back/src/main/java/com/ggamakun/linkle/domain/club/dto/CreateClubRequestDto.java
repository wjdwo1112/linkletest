package com.ggamakun.linkle.domain.club.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "동호회 생성 요청 DTO")
public class CreateClubRequestDto {
	
	@Schema(hidden = true)
    private Integer clubId;
    
    @Schema(description = "동호회 이름", example = "서울 축구 동호회")
    @NotBlank(message = "동호회 이름을 입력해주세요.")
    @Size(max = 30, message = "동호회 이름은 30자 이내로 입력해주세요.")
    private String name;
    
    @Schema(description = "카테고리 ID", example = "14")
    @NotNull(message = "관심사를 선택해주세요.")
    private Integer categoryId;
    
    @Schema(description = "지역(시도)", example = "서울특별시")
    @NotBlank(message = "지역을 선택해주세요.")
    private String sido;
    
    @Schema(description = "지역(시군구)", example = "강남구")
    @NotBlank(message = "지역을 선택해주세요.")
    private String sigungu;
    
    @Schema(description = "동호회 설명", example = "주말마다 축구를 즐기는 동호회입니다.")
    @Size(max = 300, message = "동호회 설명은 300자 이내로 입력해주세요.")
    private String description;
    
    @Schema(description = "모집 정원", example = "20")
    @NotNull(message = "모집 정원을 입력해주세요.")
    @Min(value = 2, message = "최소 2명 이상이어야 합니다.")
    @Max(value = 999, message = "최대 999명까지 가능합니다.")
    private Integer maxMembers;
    
    @Schema(description = "프로필 이미지 파일 ID", example = "1")
    private Integer fileId;
    
    @Schema(hidden = true)
    private Integer createdBy;
}