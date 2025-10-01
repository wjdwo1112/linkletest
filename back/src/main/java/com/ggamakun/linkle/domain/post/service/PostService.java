package com.ggamakun.linkle.domain.post.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.post.dto.CreatePostRequest;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.dto.PostSummary;
import com.ggamakun.linkle.domain.post.dto.UpdatePostRequest;
import com.ggamakun.linkle.domain.post.entity.Post;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService implements IPostService {

	private final IPostRepository postRepository;
	
	@Override
	public List<Post> listAll() {
		
		return postRepository.listAll();
	}

	@Override
	public List<PostSummary> listSummary() {
		
		return postRepository.listSummary();
	}

	@Override
	public PostDetail getPost(Integer postId, boolean increase) {
		
		PostDetail dto = postRepository.findPostDetail(postId);
		if(dto == null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		if(increase) {
			postRepository.increaseViewCount(postId);
		}
		return dto;
	}

	@Override
	public Integer insertPost(CreatePostRequest request) {
		
		return postRepository.insertPost(request);
	}

	@Override
	public PostDetail updatePost(Integer postId, UpdatePostRequest request) {
		int updated = postRepository.updatePost(postId, request);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		}
		return postRepository.findPostDetail(postId);
	}

	@Override
	public int deletePost(Integer postId) {
		
		return postRepository.deletePost(postId);
	}
	
	

	
	


}
