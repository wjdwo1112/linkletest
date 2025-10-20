package com.ggamakun.linkle.domain.gallery.service;

import java.util.List;

import com.ggamakun.linkle.domain.gallery.dto.CreateGalleryRequest;
import com.ggamakun.linkle.domain.gallery.dto.GalleryDto;

public interface IGalleryService {

	List<GalleryDto> galleryList();

	GalleryDto getGallery(Integer galleryId);

	Integer createGallery(CreateGalleryRequest request);

	void deleteGallery(Integer galleryId, Integer memberId);

	List<GalleryDto> galleryListByClubId(Integer clubId);

}
