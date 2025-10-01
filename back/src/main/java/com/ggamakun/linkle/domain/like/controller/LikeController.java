package com.ggamakun.linkle.domain.like.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;
import com.ggamakun.linkle.domain.like.service.ILikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LikeController {
	private final ILikeService likeService;
	
	@PostMapping("/api/posts/{postid}/likes")
	public ResponseEntity<LikeResponseDto> postLike(@PathVariable("postid") Integer postId, @RequestHeader("X-member-id") Integer memberId){
		return ResponseEntity.ok(likeService.togglePostLike(postId,memberId));
	}
	
	
	
	@GetMapping("/api/posts/{postId}/likes/status")
	public LikeResponseDto status(@PathVariable Integer postId, @RequestHeader("X-MEMBER-ID") Integer memberId) {
	return likeService.getStatus(postId, memberId);
	    }

	    
}
