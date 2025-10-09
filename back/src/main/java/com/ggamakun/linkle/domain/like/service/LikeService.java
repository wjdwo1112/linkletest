package com.ggamakun.linkle.domain.like.service;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.comment.repository.ICommentRepository;
import com.ggamakun.linkle.domain.like.dto.LikeResponseDto;
import com.ggamakun.linkle.domain.like.repository.ILikeRepository;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikeService implements ILikeService {
	private final ILikeRepository likeRepository;
	private final IPostRepository postRepository;
	private final ICommentRepository commentRepository;
	
	@Transactional
	@Override
	public LikeResponseDto togglePostLike(Integer postId, Integer memberId) {
		
		int canceled = likeRepository.cancelPostLike(postId, memberId);
		if(canceled > 0) {
			postRepository.decreaseLikeCount(postId);
			return new LikeResponseDto(false, safePostCount(postId));
		}
		
		int reactivated = likeRepository.reactivatePostLike(postId, memberId);
		if(reactivated > 0) {
			postRepository.increaseLikeCount(postId);
			return new LikeResponseDto(true, safePostCount(postId));
		}
		
		try {
			likeRepository.insertPostLike(postId, memberId);
			postRepository.increaseLikeCount(postId);
		}catch(DuplicateKeyException e) {
			
		}
		return new LikeResponseDto(true, safePostCount(postId));
	}
		
	
	@Override
	public LikeResponseDto getPostStatus(Integer postId, Integer memberId) {
        boolean liked = likeRepository.existsPostLike(postId, memberId) > 0;
        Integer cnt = postRepository.getLikeCount(postId);
        int count = (cnt == null ? 0: cnt);
        return new LikeResponseDto(liked, count);
    }
	
	private int safePostCount(Integer postId) {
		Integer cnt = postRepository.getLikeCount(postId);
		return cnt == null ? 0 : cnt;
	}

	
	
	//---------------------------댓글-------------------------------------------------

	@Override
	public LikeResponseDto toggleCommentLike(Integer commentId, Integer memberId) {
		int canceled = likeRepository.cancelCommentLike(commentId, memberId);
		if(canceled > 0) {
			commentRepository.decreaseLikeCount(commentId);
			return new LikeResponseDto(false, safeCommentCount(commentId));
			
		}
		
		int reactivated = likeRepository.reactivateCommentLike(commentId, memberId);
		if(reactivated > 0) {
			commentRepository.increaseLikeCount(commentId);
			return new LikeResponseDto(true, safeCommentCount(commentId));
		}
		
		try {
			likeRepository.insertCommentLike(commentId, memberId);
			commentRepository.increaseLikeCount(commentId);
		}catch(DuplicateKeyException e) {
			
		}
		return new LikeResponseDto(true,safeCommentCount(commentId));
		
	}


	@Override
	public LikeResponseDto getCommentStatus(Integer commentId, Integer memberId) {
		boolean liked = likeRepository.existsPostLike(commentId, memberId) > 0;
        Integer cnt = commentRepository.getLikeCount(commentId);
        int count = (cnt == null ? 0: cnt);
        return new LikeResponseDto(liked, count);
	}

	private int safeCommentCount(Integer commentId) {
		Integer cnt = commentRepository.getLikeCount(commentId);
		return cnt == null ? 0 : cnt;
	}
}
