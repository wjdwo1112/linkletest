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
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/comments")
@Slf4j
@Tag(name="좋아요", description="댓글 좋아요 관련 API")
public class CommentLikeController {

	private final ILikeService commentLikeService;
	
	@PostMapping("{commentid}/likes")
	public ResponseEntity<LikeResponseDto> commentLike(@PathVariable("commentid") Integer commentId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		log.info("좋아요 토글 요청 - 게시물 ID:{}, 회원 ID: {}", commentId, memberId);
		return ResponseEntity.ok(commentLikeService.toggleCommentLike(commentId,memberId));
	}
	
	@GetMapping("{commentid}/likes/status")
	public LikeResponseDto commentStatus(@PathVariable("commentid") Integer commentId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
		Integer memberId = userDetails.getMember().getMemberId();
		return commentLikeService.getCommentStatus(commentId, memberId);
	}
	
}
