package com.ggamakun.linkle.domain.category.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.category.dto.CategoryResponseDto;
import com.ggamakun.linkle.domain.category.service.CategoryService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "카테고리", description = "카테고리 관련 API")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping("/hierarchy")
    public ResponseEntity<List<CategoryResponseDto>> getCategoriesHierarchy() {
        log.info("카테고리 계층 구조 조회 요청");
        List<CategoryResponseDto> categories = categoryService.getAllCategoriesHierarchy();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/children")
    public ResponseEntity<List<CategoryResponseDto>> getChildCategoriesOnly() {
        log.info("2차 카테고리 조회 요청");
        List<CategoryResponseDto> categories = categoryService.getChildCategoriesOnly();
        return ResponseEntity.ok(categories);
    }
}