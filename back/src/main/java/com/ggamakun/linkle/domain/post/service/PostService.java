package com.ggamakun.linkle.domain.post.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
	@Transactional(readOnly=false)
	public PostDetail getPost(Integer postId, boolean increase) {
		
		if(increase) {
			postRepository.increaseViewCount(postId);
		}
		PostDetail dto = postRepository.findPostDetail(postId);
		if(dto == null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
	
		return dto;
	}

	@Override
	@Transactional
	public Integer insertPost(CreatePostRequest request) {
		
		return postRepository.insertPost(request);
	}

	@Override
	@Transactional
	public PostDetail updatePost(Integer postId, UpdatePostRequest request) {
		int updated = postRepository.updatePost(postId, request);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		}
		return postRepository.findPostDetail(postId);
	}

	@Override
	@Transactional
	public int deletePost(Integer postId) {
		
		return postRepository.deletePost(postId);
	}
	
	

	
	


}
