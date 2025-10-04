package com.ggamakun.linkle.domain.comment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.comment.dto.CommentDto;
import com.ggamakun.linkle.domain.comment.dto.CreateCommentRequest;
import com.ggamakun.linkle.domain.comment.dto.UpdateCommentRequest;
import com.ggamakun.linkle.domain.comment.service.ICommentService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommentController {
	private final ICommentService commentService;
	
	//댓글 목록 조회
	@GetMapping("/posts/{postid}/comments")
	@Operation(
			summary = "댓글 목록 조회", 
			description = "특정 게시글의 모든 댓글을 계층 구조로 조회합니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
		})
	ResponseEntity<List<CommentDto>> getComments(@PathVariable("postid") Integer postId){
		List<CommentDto> comments = commentService.getCommentbyPostId(postId);
		return ResponseEntity.ok(comments);
	}
	
	//댓글 상세 조회
	@GetMapping("/comments/{commentid}")
	@Operation(
			summary = "댓글 상세 조회", 
			description = "특정 댓글 하나를 조회합니다. 댓글인 경우 대댓글도 함께 반환됩니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
		})
	ResponseEntity<CommentDto> getComment(@PathVariable("commentid") Integer commentId){
		CommentDto comment = commentService.getCommentbyId(commentId);
		return ResponseEntity.ok(comment);
	}
	
	
	//댓글 등록
	@PostMapping("/posts/{postid}/comments")
	@Operation(
			summary = "댓글 작성", 
			description = "게시글에 댓글 또는 대댓글을 작성합니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "댓글 작성 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
		})
	ResponseEntity<CommentDto> insertComment(@PathVariable("postid") Integer postId, @RequestBody CreateCommentRequest request,
											 @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		request.setPostId(postId);
		request.setCreatedBy(memberId);
		
		commentService.insertComment(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	//댓글 수정
	@PutMapping("/comments/{commentid}")
	@Operation(
			summary = "댓글 수정",
			description = "작성한 댓글을 수정합니다. (로그인 필수, 작성자만 가능)"
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "수정 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "403", description = "권한 없음 (작성자가 아님)"),
			@ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
		})
	ResponseEntity<CommentDto> updateComment(@PathVariable("commentid") Integer commentId, @RequestBody UpdateCommentRequest request,
											 @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		
		commentService.updateComment(commentId,request.getContent(),memberId );
		return ResponseEntity.ok().build();
	}
	
	//댓글 삭제
	@DeleteMapping("/comments/{commentid}")
	@Operation(
			summary = "댓글 삭제",
			description = "작성한 댓글을 삭제합니다. (로그인 필수, 작성자만 가능)"
		)
		@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "삭제 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패"),
			@ApiResponse(responseCode = "403", description = "권한 없음 (작성자가 아님)"),
			@ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
		})
	ResponseEntity<Void> deleteComment(@PathVariable("commentid") Integer commentId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		commentService.deleteComment(commentId, memberId);
		return ResponseEntity.noContent().build();
	}
}
