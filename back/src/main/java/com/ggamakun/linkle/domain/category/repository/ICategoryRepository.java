package com.ggamakun.linkle.domain.category.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.ggamakun.linkle.domain.category.entity.Category;

@Mapper
public interface ICategoryRepository {
    
    // 모든 카테고리 조회
    List<Category> findAll();
    
    // 1차 카테고리 조회 (부모가 없는 카테고리)
    List<Category> findParentCategories();
    
    // 특정 부모의 하위 카테고리 조회
    List<Category> findChildCategories(Integer parentCategoryId);
    
    // 카테고리 ID로 조회
    Category findById(Integer categoryId);
}