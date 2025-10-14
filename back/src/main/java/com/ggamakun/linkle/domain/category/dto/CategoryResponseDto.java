package com.ggamakun.linkle.domain.category.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "카테고리 응답 DTO")
public class CategoryResponseDto {
    
    @Schema(description = "카테고리 ID", example = "1")
    private Integer categoryId;
    
    @Schema(description = "부모 카테고리 ID (1차 카테고리는 null)", example = "null")
    private Integer parentCategoryId;
    
    @Schema(description = "카테고리 이름", example = "푸드·드링크")
    private String name;
    
    @Schema(description = "하위 카테고리 목록")
    private List<CategoryResponseDto> children;
}