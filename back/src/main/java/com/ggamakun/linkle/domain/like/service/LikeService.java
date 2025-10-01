package com.ggamakun.linkle.domain.like.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;
import com.ggamakun.linkle.domain.like.repository.ILikeRepository;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService implements ILikeService {
	private final ILikeRepository likeRepository;
	private final IPostRepository postRepository;
	
	@Transactional
	@Override
	public LikeResponseDto togglePostLike(Integer postId, Integer memberId) {
		
		int deleted = likeRepository.deletePostLike(postId, memberId);
		boolean liked;
		
		if(deleted > 0) {
			postRepository.decreaseLikeCount(postId);
			liked = false;
		}else {
			likeRepository.insertPostLike(postId, memberId);
			postRepository.increaseLikeCount(postId);
			liked = true;
		}
		
		int count = postRepository.getLikeCount(postId);
		
		return new LikeResponseDto(liked, count);
	}
	
	@Override
	public LikeResponseDto getStatus(Integer postId, Integer memberId) {
        boolean liked = likeRepository.existsPostLike(postId, memberId) > 0;
        int count = postRepository.getLikeCount(postId);
        return new LikeResponseDto(liked, count);
    }

}
