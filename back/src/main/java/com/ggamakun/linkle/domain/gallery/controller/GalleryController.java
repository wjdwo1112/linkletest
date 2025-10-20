package com.ggamakun.linkle.domain.gallery.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.gallery.dto.CreateGalleryRequest;
import com.ggamakun.linkle.domain.gallery.dto.GalleryDto;
import com.ggamakun.linkle.domain.gallery.service.IGalleryService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/gallery")
public class GalleryController {
	private final IGalleryService galleryService;
	
	//갤러리 목록 조회
	@GetMapping("list")
	public List<GalleryDto> galleryList(@RequestParam(name = "clubId", required = false) Integer clubId){
		if(clubId != null) {
			return galleryService.galleryListByClubId(clubId);
		}
		return galleryService.galleryList();
	}
	
	//갤러리 상세 조회
	@GetMapping("/{galleryid}")
	public GalleryDto getGallery(@PathVariable("galleryid") Integer galleryId) {
		return galleryService.getGallery(galleryId);
	}
	
	//갤러리 등록
	@PostMapping("")
	public ResponseEntity<?> createGallery(@RequestBody CreateGalleryRequest request,
										  @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		request.setCreatedBy(memberId);
		galleryService.createGallery(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	//갤러리 삭제
	@DeleteMapping("/{galleryid}")
	public ResponseEntity<Void> deleteGallery(@PathVariable("galleryid") Integer galleryId,
											  @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		galleryService.deleteGallery(galleryId, memberId);
		return ResponseEntity.noContent().build();
	}
}
