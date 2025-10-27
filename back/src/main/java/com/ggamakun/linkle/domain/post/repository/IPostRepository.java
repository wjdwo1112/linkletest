package com.ggamakun.linkle.domain.post.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.post.dto.CreatePostRequest;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.dto.PostSummary;
import com.ggamakun.linkle.domain.post.dto.UpdatePostRequest;
import com.ggamakun.linkle.domain.post.entity.Post;

@Mapper
public interface IPostRepository {

	List<Post> listAll();

	List<PostSummary> listSummary();

	void increaseViewCount(Integer postId);

	PostDetail findPostDetail(Integer postId);

	Integer insertPost(CreatePostRequest request);

	int updatePost(@Param("postId")Integer postId, @Param("request")UpdatePostRequest request, @Param("updatedBy") Integer updatedBy);

	int deletePost(@Param("postId")Integer postId, @Param("updatedBy") Integer updatedBy);

	int increaseLikeCount(Integer postId);
	
	int decreaseLikeCount(Integer postId);

	Integer getLikeCount(Integer postId);
	
	int increaseCommentCount(Integer postId);
	
	int decreaseCommentCount(Integer postId);
}
