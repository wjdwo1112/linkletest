package com.ggamakun.linkle.domain.like.service;

import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;

public interface ILikeService {

	LikeResponseDto togglePostLike(Integer postId, Integer memberId);

	LikeResponseDto getStatus(Integer postId, Integer memberId);
	
	

	
}
