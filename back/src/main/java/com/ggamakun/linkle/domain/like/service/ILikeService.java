package com.ggamakun.linkle.domain.like.service;

import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;

public interface ILikeService {

	LikeResponseDto togglePostLike(Integer postId, Integer memberId);

	LikeResponseDto getPostStatus(Integer postId, Integer memberId);
	
	
	LikeResponseDto toggleCommentLike(Integer commentId, Integer memberId);
	LikeResponseDto getCommentStatus(Integer commentId, Integer memberId);
	
}
