package com.ggamakun.linkle.domain.category.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    private Integer categoryId;
    private Integer parentCategoryId;
    private String name;
    private String isDeleted;
}