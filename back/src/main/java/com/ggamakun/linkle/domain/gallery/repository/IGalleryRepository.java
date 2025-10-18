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

	GalleryDto findById(@Param("galleryId") Integer galleryId);

	//갤러리 등록
	Integer insertGallery(@Param("request") CreateGalleryRequest request);

	int deleteGallery(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);

}
