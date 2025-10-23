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

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommentController {
	private final ICommentService commentService;
	
	//댓글 목록 조회
	@GetMapping("/posts/{postid}/comments")
	ResponseEntity<List<CommentDto>> getComments(@PathVariable("postid") Integer postId){
		List<CommentDto> comments = commentService.getCommentbyPostId(postId);
		return ResponseEntity.ok(comments);
	}
	
	//댓글 상세 조회
	@GetMapping("/comments/{commentid}")
	ResponseEntity<CommentDto> getComment(@PathVariable("commentid") Integer commentId){
		CommentDto comment = commentService.getCommentbyId(commentId);
		return ResponseEntity.ok(comment);
	}
	
	
	//댓글 등록
	@PostMapping("/posts/{postid}/comments")
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
	ResponseEntity<CommentDto> updateComment(@PathVariable("commentid") Integer commentId, @RequestBody UpdateCommentRequest request,
											 @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		
		commentService.updateComment(commentId,request.getContent(),memberId );
		return ResponseEntity.ok().build();
	}
	
	//댓글 삭제
	@DeleteMapping("/comments/{commentid}")
	ResponseEntity<Void> deleteComment(@PathVariable("commentid") Integer commentId, @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		commentService.deleteComment(commentId, memberId);
		return ResponseEntity.noContent().build();
	}
}
