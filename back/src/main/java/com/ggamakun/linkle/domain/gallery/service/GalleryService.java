package com.ggamakun.linkle.domain.gallery.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.gallery.dto.CreateGalleryRequest;
import com.ggamakun.linkle.domain.gallery.dto.GalleryDto;
import com.ggamakun.linkle.domain.gallery.repository.IGalleryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GalleryService implements IGalleryService
{
	private final IGalleryRepository galleryRepository;
	@Override
	public List<GalleryDto> galleryList() {
		
		return galleryRepository.galleryList();
	}
	
	@Override
	public List<GalleryDto> galleryListByClubId(Integer clubId){
		return galleryRepository.galleryListByClubId(clubId);
	}
	
	@Override
	public GalleryDto getGallery(Integer galleryId) {
		
		return galleryRepository.findById(galleryId);
	}

	@Override
	public Integer createGallery(CreateGalleryRequest request) {
		// TODO Auto-generated method stub
		return galleryRepository.insertGallery(request);
	}

	@Override
	@Transactional
	public void deleteGallery(Integer galleryId, Integer memberId) {
		
		//게시글 존재 여부 확인
		GalleryDto gallery = galleryRepository.findById(galleryId);
			if(gallery == null) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND,"게시글을 찾을 수 없다.");
		}
		//작성자 본인 확인
		if(!gallery.getCreatedBy().equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"게시글 작성자만 삭제할 수 있다");
		}
				
		//게시글 삭제
		int deleted = galleryRepository.deleteGallery(galleryId, memberId);
		if(deleted == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 삭제에 실패했다.");
		}
		
		
	}

}
