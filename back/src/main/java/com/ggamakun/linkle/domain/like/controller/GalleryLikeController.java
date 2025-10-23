package com.ggamakun.linkle.domain.like.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;
import com.ggamakun.linkle.domain.like.service.ILikeService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/gallery")
public class GalleryLikeController {
private final ILikeService likeService;
	
	@PostMapping("{galleryid}/likes")
	public ResponseEntity<LikeResponseDto> galleryLike(@PathVariable("galleryid") Integer galleryId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		log.info("좋아요 토글 요청 - 갤러리 ID:{}, 회원 ID: {}", galleryId, memberId);
		return ResponseEntity.ok(likeService.toggleGalleryLike(galleryId,memberId));
	}
	
	@GetMapping("{galleryid}/likes/status")
	public LikeResponseDto galleryStatus(@PathVariable("galleryid") Integer galleryId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
		Integer memberId = userDetails.getMember().getMemberId();
		return likeService.getGalleryStatus(galleryId, memberId);
	}

}
