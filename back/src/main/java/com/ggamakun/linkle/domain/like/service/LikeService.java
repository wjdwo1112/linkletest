package com.ggamakun.linkle.domain.like.service;

import org.springframework.dao.DuplicateKeyException;
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
		
		int canceled = likeRepository.cancelPostLike(postId, memberId);
		if(canceled > 0) {
			postRepository.decreaseLikeCount(postId);
			return new LikeResponseDto(false, safeCount(postId));
		}
		
		int reactivated = likeRepository.reactivatePostLike(postId, memberId);
		if(reactivated > 0) {
			postRepository.increaseLikeCount(postId);
			return new LikeResponseDto(true, safeCount(postId));
		}
		
		try {
			likeRepository.insertPostLike(postId, memberId);
			postRepository.increaseLikeCount(postId);
		}catch(DuplicateKeyException e) {
			
		}
		return new LikeResponseDto(true, safeCount(postId));
	}
		
	
	@Override
	public LikeResponseDto getStatus(Integer postId, Integer memberId) {
        boolean liked = likeRepository.existsPostLike(postId, memberId) > 0;
        Integer cnt = postRepository.getLikeCount(postId);
        int count = (cnt == null ? 0: cnt);
        return new LikeResponseDto(liked, count);
    }
	
	private int safeCount(Integer postId) {
		Integer cnt = postRepository.getLikeCount(postId);
		return cnt == null ? 0 : cnt;
	}

}
