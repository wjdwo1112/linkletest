package com.ggamakun.linkle.domain.comment.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.comment.dto.CommentDto;
import com.ggamakun.linkle.domain.comment.dto.CreateCommentRequest;
import com.ggamakun.linkle.domain.comment.repository.ICommentRepository;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {
	private final ICommentRepository commentRepository;
	private final IPostRepository postRepository;
	
	//해당 게시글의 모든 댓글 행(부모+자식)을 조회
	//최상위 댓글만 먼저 뽑고 -> 각 최상위 댓글에 자기 자식(대댓글)을 붙인다.
	@Override
	public List<CommentDto> getCommentbyPostId(Integer postId) {
		
		List<CommentDto> allComments = commentRepository.findByPostId(postId);
		
		List<CommentDto> parentComments = new ArrayList<>();
		for(int i=0; i<allComments.size(); i++) {
			CommentDto c = allComments.get(i);
			if(c.getParentCommentId() == null){
				parentComments.add(c);
			}
		}
		
		for(int i=0; i<parentComments.size(); i++) {
			CommentDto parent = parentComments.get(i);
			List<CommentDto> replies = new ArrayList<>();
			for(int j=0; j<allComments.size(); j++) {
				CommentDto c = allComments.get(j);
				if(c.getParentCommentId() != null && c.getParentCommentId().equals(parent.getCommentId())) {
					replies.add(c);
				}
			}
			parent.setReplies(replies);
		}
		
		return parentComments;
	}
	
	//댓글 상세 조회
	@Override
	public CommentDto getCommentbyId(Integer commentId) {
		
		return commentRepository.findById(commentId);
	}
	
	//댓글 등록
	@Transactional
	@Override
	public  void insertComment(CreateCommentRequest request) {
		commentRepository.insertComment(request);
		
		//대댓글일때 부모 댓글의 댓글개수가 올라감
		if(request.getParentCommentId() != null) {
			commentRepository.increaseCommentCount(request.getParentCommentId());
		}
		
		//게시글의 댓글 수 증가
		postRepository.increaseCommentCount(request.getPostId());
	}

	
	//댓글 수정 
	@Transactional
	@Override
	public void updateComment(Integer commentId, String content, Integer memberId) {
		//댓글 존재 여부 확인
		CommentDto comment = commentRepository.findById(commentId);
		if(comment == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"댓글을 찾을 수 없습니다");
		}
		
		//작성자 본인 확인
		if(!comment.getCreatedBy().equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"댓글 작성자만 수정할 수 있습니다.");
		}
		
		//댓글 수정
		int updated = commentRepository.updateComment(commentId, content);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 수정 실패");
		}
	}

	@Transactional
	@Override
	public void deleteComment(Integer commentId, Integer memberId) {
		// 댓글 존재 여부 확인
		CommentDto comment = commentRepository.findById(commentId);
		if(comment == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, " 댓글을 찾을 수 없습니다.");
		}
		
		// 댓글 작성자 확인
		if(!comment.getCreatedBy().equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글 작성자만 삭제할 수 있습니다");
		}
		// 댓글 삭제
		int deleted = commentRepository.deleteComment(commentId);
		if(deleted == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"댓글 삭제에 실패했습니다");
		}
		
		//대댓글인 경우 부모댓글의 댓글 개수 감소
		if(comment.getParentCommentId() != null) {
			commentRepository.decreaseCommentCount(comment.getParentCommentId());
		}
		
		//게시글의 댓글 수 감소
		postRepository.decreaseCommentCount(comment.getPostId());
		
		
	}
	
	
	
	
	
	
	

}
