package com.ggamakun.linkle.domain.category.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDto {
    private Integer categoryId;
    private Integer parentCategoryId;
    private String name;
    private List<CategoryResponseDto> children;
}