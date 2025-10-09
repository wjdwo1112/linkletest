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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
@Slf4j
@Tag(name="좋아요", description="게시물 좋아요 관련 API")
public class PostLikeController {
	private final ILikeService likeService;
	
	@PostMapping("{postid}/likes")
	@Operation(
			summary = "좋아요 토글", 
			description = "게시물에 좋아요를 추가하거나 취소합니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "좋아요 토글 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "404", description = "게시물을 찾을 수 없음")
		})
	public ResponseEntity<LikeResponseDto> postLike(@PathVariable("postid") Integer postId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		log.info("좋아요 토글 요청 - 게시물 ID:{}, 회원 ID: {}", postId, memberId);
		return ResponseEntity.ok(likeService.togglePostLike(postId,memberId));
	}
	
	
	
	@GetMapping("{postid}/likes/status")
	@Operation(
			summary = "좋아요 상태 조회", 
			description = "현재 사용자의 게시물 좋아요 상태를 조회합니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
		)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "404", description = "게시물을 찾을 수 없음")
		})
	public LikeResponseDto postStatus(@PathVariable("postid") Integer postId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
		Integer memberId = userDetails.getMember().getMemberId();
	return likeService.getPostStatus(postId, memberId);
	    }

	    
}
