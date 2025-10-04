package com.ggamakun.linkle.domain.comment.service;

import java.util.List;

import com.ggamakun.linkle.domain.comment.dto.CommentDto;
import com.ggamakun.linkle.domain.comment.dto.CreateCommentRequest;

public interface ICommentService {
	
	//댓글 목록 조회
	List<CommentDto> getCommentbyPostId(Integer postId);
	
	//댓글 상세 조회
	CommentDto getCommentbyId(Integer commentId);
	
	//댓글 등록
	void insertComment(CreateCommentRequest request);

	//댓글 수정
	void updateComment(Integer commentId, String content, Integer memberId);

	void deleteComment(Integer commentId, Integer memberId);

}
