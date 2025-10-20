package com.ggamakun.linkle.domain.gallery.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.gallery.dto.CreateGalleryRequest;
import com.ggamakun.linkle.domain.gallery.dto.GalleryDto;

@Mapper
public interface IGalleryRepository {

	//갤러리 리스트 조회
	List<GalleryDto> galleryList();
	
	//동호회별 갤러리 리스트 조회
	List<GalleryDto> galleryListByClubId(@Param("clubId") Integer clubId);
	//갤러리 상세 조회
	GalleryDto findById(@Param("galleryId") Integer galleryId);

	//갤러리 등록
	Integer insertGallery(CreateGalleryRequest request);
	
	//갤러리 삭제
	int deleteGallery(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);

	//좋아요 증가
	int increaseLikeCount(Integer galleryId);
	
	//좋아요 감소
	int decreaseLikeCount(Integer galleryId);
	
	//현재 좋아요 조회
	Integer getLikeCount(Integer galleryId);
	
	
	
}
