package com.ggamakun.linkle.domain.post.service;

import java.util.List;

import com.ggamakun.linkle.domain.post.dto.CreatePostRequest;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.dto.PostSummary;
import com.ggamakun.linkle.domain.post.dto.UpdatePostRequest;
import com.ggamakun.linkle.domain.post.entity.Post;

public interface IPostService {

	List<Post> listAll();

	List<PostSummary> listSummary();

	PostDetail getPost(Integer postId, boolean increase);

	Integer insertPost(CreatePostRequest request);

	PostDetail updatePost(Integer postId, UpdatePostRequest request, Integer memberId);

	void deletePost(Integer postId, Integer memberId);
	
	

}
