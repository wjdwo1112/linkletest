package com.ggamakun.linkle.domain.category.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.category.dto.CategoryResponseDto;
import com.ggamakun.linkle.domain.category.entity.Category;
import com.ggamakun.linkle.domain.category.repository.ICategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService implements ICategoryService {
    
    private final ICategoryRepository categoryRepository;
    
    /**
     * 모든 카테고리를 계층 구조로 반환
     */
    public List<CategoryResponseDto> getAllCategoriesHierarchy() {
        log.info("카테고리 계층 구조 조회");
        
        // 모든 카테고리 조회
        List<Category> allCategories = categoryRepository.findAll();
        
        // 부모 카테고리와 자식 카테고리를 매핑
        Map<Integer, List<Category>> childrenMap = new HashMap<>();
        List<Category> parentCategories = new ArrayList<>();
        
        for (Category category : allCategories) {
            if (category.getParentCategoryId() == null) {
                // 1차 카테고리 (부모 카테고리)
                parentCategories.add(category);
            } else {
                // 2차 카테고리 (자식 카테고리)
                childrenMap
                    .computeIfAbsent(category.getParentCategoryId(), k -> new ArrayList<>())
                    .add(category);
            }
        }
        
        // DTO로 변환
        return parentCategories.stream()
            .map(parent -> {
                CategoryResponseDto dto = CategoryResponseDto.builder()
                    .categoryId(parent.getCategoryId())
                    .parentCategoryId(parent.getParentCategoryId())
                    .name(parent.getName())
                    .build();
                
                // 자식 카테고리가 있으면 추가
                List<Category> children = childrenMap.get(parent.getCategoryId());
                if (children != null) {
                    List<CategoryResponseDto> childrenDtos = children.stream()
                        .map(child -> CategoryResponseDto.builder()
                            .categoryId(child.getCategoryId())
                            .parentCategoryId(child.getParentCategoryId())
                            .name(child.getName())
                            .build())
                        .collect(Collectors.toList());
                    dto.setChildren(childrenDtos);
                }
                
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 2차 카테고리만 조회 (관심사 선택용)
     */
    public List<CategoryResponseDto> getChildCategoriesOnly() {
        log.info("2차 카테고리만 조회");
        
        List<Category> allCategories = categoryRepository.findAll();
        
        return allCategories.stream()
            .filter(category -> category.getParentCategoryId() != null)
            .map(category -> CategoryResponseDto.builder()
                .categoryId(category.getCategoryId())
                .parentCategoryId(category.getParentCategoryId())
                .name(category.getName())
                .build())
            .collect(Collectors.toList());
    }
}