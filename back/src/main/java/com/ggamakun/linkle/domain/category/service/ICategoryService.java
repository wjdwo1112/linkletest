package com.ggamakun.linkle.domain.category.service;

import java.util.List;

import com.ggamakun.linkle.domain.category.dto.CategoryResponseDto;

public interface ICategoryService {
    
    /**
     * 모든 카테고리를 계층 구조로 반환
     */
    List<CategoryResponseDto> getAllCategoriesHierarchy();
    
    /**
     * 2차 카테고리만 조회 (관심사 선택용)
     */
    List<CategoryResponseDto> getChildCategoriesOnly();
}