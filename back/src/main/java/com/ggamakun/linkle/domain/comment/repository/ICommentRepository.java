package com.ggamakun.linkle.domain.comment.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.comment.dto.CommentDto;
import com.ggamakun.linkle.domain.comment.dto.CreateCommentRequest;

@Mapper
public interface ICommentRepository {
	//특정 게시글의 모든 댓글 조회(댓글+대댓글) -> 삭제된것 숨긴다, 대댓글 있으면 노출
	List<CommentDto> findByPostId(Integer postId);
	
	//댓글 상세 조회
	CommentDto findById(Integer commentId);
	
	//댓글 등록
	void insertComment(CreateCommentRequest request);
	
	//댓글 수정
	int updateComment(@Param("commentId") Integer commentId, @Param("content") String content, @Param("memberId") Integer memberId);
	
	//댓글 삭제
	int deleteComment(@Param("commentId")Integer commentId, @Param("updatedBy") Integer updatedBy);
	
	//댓글 삭제(대댓글 있을때)
	int deleteComments(@Param("commentId")Integer commentId, @Param("updatedBy") Integer updatedBy);
	
	//부모댓글의 대댓글 갯수 증가
	int increaseCommentCount(Integer parentCommentId);
	
	//부모 댓글의 대댓글 갯수 감소
	int decreaseCommentCount(Integer parentCommentId);
	
	//댓글 좋아요 증가
	int increaseLikeCount(Integer commentId);
	
	//댓글 좋아요 감소
	int decreaseLikeCount(Integer commentId);
	
	//댓글 좋아요 갯수 조회
	Integer getLikeCount(Integer commentId);

	int countChildren(Integer parentId);
	
	
}
