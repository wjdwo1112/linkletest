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
		
		//이미 삭제된 댓글인지 확인
		if("Y".equals(comment.getIsDeleted())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"삭제된 댓글은 수정 불가");
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
	    // 삭제 포함 단건 조회
	    CommentDto comment = commentRepository.findById(commentId);
	    if (comment == null) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
	    }
	    if (!comment.getCreatedBy().equals(memberId)) {
	        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글 작성자만 삭제할 수 있습니다");
	    }
	    // 삭제된 댓글인지 확인
	    if ("Y".equals(comment.getIsDeleted())) {
	        return;
	    }

	    // 자식 여부 즉시 확인
	    int children = commentRepository.countChildren(commentId);

	    if (children > 0) {
	        // 부모 soft delete: 총 댓글 수는 유지
	        int n = commentRepository.deleteComments(commentId);
	        if (n == 0) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");
	        return;
	    }

	    // 여기서부터 children == 0 (자식 없음)
	    int n = commentRepository.deleteComment(commentId);
	    if (n == 0) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");

	    if (comment.getParentCommentId() != null) {
	        // 대댓글 삭제
	        Integer parentId = comment.getParentCommentId();
	        commentRepository.decreaseCommentCount(parentId);                // 부모의 대댓글 수 -1
	        postRepository.decreaseCommentCount(comment.getPostId());       // 게시글 총 댓글 수 -1 (이번 대댓글)

	        // 부모가 삭제(Y) 상태이고, 이제 자식이 0이면 → 부모 placeholder도 빠짐 → 추가 -1
	        int remain = commentRepository.countChildren(parentId);
	        if (remain == 0) {
	            CommentDto parent = commentRepository.findById(parentId);
	            if (parent != null && "Y".equals(parent.getIsDeleted())) {
	                postRepository.decreaseCommentCount(parent.getPostId()); // 추가 -1
	            }
	        }
	    } else {
	        // 최상위 댓글(자식 없음) 삭제
	        postRepository.decreaseCommentCount(comment.getPostId());       // -1
	    }
	}

	
	
	
	
	

}
