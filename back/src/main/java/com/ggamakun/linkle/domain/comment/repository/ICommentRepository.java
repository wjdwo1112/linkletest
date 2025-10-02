package com.ggamakun.linkle.domain.comment.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.ggamakun.linkle.domain.comment.dto.CommentDto;
import com.ggamakun.linkle.domain.comment.dto.CreateCommentRequest;

@Mapper
public interface ICommentRepository {
	//특정 게시글의 모든 댓글 조회(댓글+대댓글)
	List<CommentDto> findByPostId(Integer postId);
	
	//댓글 상세 조회
	CommentDto findById(Integer commentId);
	
	//댓글 등록
	void insertComment(CreateCommentRequest request);
	
	//부모댓글의 대댓글 갯수 증가
	int increaseCommentCount(Integer parentCommentId);
	
}
