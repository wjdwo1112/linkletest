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

import io.swagger.v3.oas.annotations.Parameter;
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
	public PostDetail getPost(@PathVariable("postid") Integer postId){
		return postService.getPost(postId, true);
	}
	
	//커뮤니티 게시글 등록
	@PostMapping("")
	public ResponseEntity<?> createPost(@RequestBody CreatePostRequest request,
										@Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		request.setCreatedBy(memberId);
		
		postService.insertPost(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	//게시글 수정
	@PutMapping("/{postid}")
	public ResponseEntity<PostDetail> updatePost(@PathVariable("postid") Integer postId , @RequestBody UpdatePostRequest request,
												 @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		
		PostDetail updated = postService.updatePost(postId,request,memberId);
		
		return ResponseEntity.ok(updated);
		
	}
	
	//게시글 삭제(소프트)
	@DeleteMapping("/{postid}")
	public ResponseEntity<Void> deletePost(@PathVariable("postid") Integer postId,
										   @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		
		Integer memberId = userDetails.getMember().getMemberId();
		postService.deletePost(postId, memberId);
		
		return ResponseEntity.noContent().build();
	}
	
	
}
