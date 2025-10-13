package com.ggamakun.linkle.domain.post.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.post.dto.CreatePostRequest;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.dto.PostSummary;
import com.ggamakun.linkle.domain.post.dto.UpdatePostRequest;
import com.ggamakun.linkle.domain.post.entity.Post;
import com.ggamakun.linkle.domain.post.service.IPostService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
	
	private final IPostService postService;
	
	@GetMapping("")
	public List<Post> list(){
		return postService.listAll();
	}
	
	@GetMapping("/summary")
	public List<PostSummary> listSummary(){
		return postService.listSummary();
	}
	
	//상세게시글 조회
	@GetMapping("/{postid}")
	@Operation(
		summary = "게시글 상세 조회",
		description = "특정 게시글의 상세 정보를 조회합니다."
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
	})
	public PostDetail getPost(@PathVariable("postid") Integer postId){
		return postService.getPost(postId, true);
	}
	
	//커뮤니티 게시글 등록
	@PostMapping("")
	@Operation(
		summary = "게시글 작성",
		description = "새로운 게시글을 작성합니다. (로그인 필수)",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "201", description = "게시글 작성 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패"),
		@ApiResponse(responseCode = "400", description = "잘못된 요청")
	})
	public ResponseEntity<?> createPost(@RequestBody CreatePostRequest request,
										@Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		request.setCreatedBy(memberId);
		
		postService.insertPost(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	//게시글 수정
	@PutMapping("/{postid}")
	@Operation(
		summary = "게시글 수정",
		description = "작성한 게시글을 수정합니다. (로그인 필수, 작성자만 가능)",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "수정 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패"),
		@ApiResponse(responseCode = "403", description = "권한 없음 (작성자가 아님)"),
		@ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
	})
	public ResponseEntity<PostDetail> updatePost(@PathVariable("postid") Integer postId , @RequestBody UpdatePostRequest request,
												 @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		
		PostDetail updated = postService.updatePost(postId,request,memberId);
		
		return ResponseEntity.ok(updated);
		
	}
	
	//게시글 삭제(소프트)
	@DeleteMapping("/{postid}")
	@Operation(
		summary = "게시글 삭제",
		description = "작성한 게시글을 삭제합니다. (로그인 필수, 작성자만 가능)",
		security = @SecurityRequirement(name = "JWT")
	)
	@ApiResponses(value = {
		@ApiResponse(responseCode = "204", description = "삭제 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패"),
		@ApiResponse(responseCode = "403", description = "권한 없음 (작성자가 아님)"),
		@ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
	})
	public ResponseEntity<Void> deletePost(@PathVariable("postid") Integer postId,
										   @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		postService.deletePost(postId, memberId);
		
		return ResponseEntity.noContent().build();
	}
	
	
}
