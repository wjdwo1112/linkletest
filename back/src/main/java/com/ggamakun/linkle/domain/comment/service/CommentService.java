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
	    // 1) 단건 조회(삭제된 것도 포함해서 읽음)
	    CommentDto comment = commentRepository.findById(commentId);
	    if (comment == null) {
	        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");
	    }
	    // 2) 작성자 본인 확인
	    if (!comment.getCreatedBy().equals(memberId)) {
	        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "댓글 작성자만 삭제할 수 있습니다.");
	    }
	    // 3) 이미 삭제된 경우 → 멱등 처리
	    if ("Y".equals(comment.getIsDeleted())) {
	        return;
	    }

	    // 4) 자식(대댓글) 존재 여부
	    int children = commentRepository.countChildren(commentId);

	    if (children > 0) {
	        // [케이스 A] 부모 댓글에 자식이 남아있는 상태에서 부모 삭제
	        // - 부모를 soft-delete(내용 NULL, is_deleted='Y')로 처리
	        // - 집계에서 부모는 제외되므로 게시글 총 댓글 수 -1
	        int n = commentRepository.deleteComments(commentId); // content=null, is_deleted='Y'
	        if (n == 0) {
	            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");
	        }
	        postRepository.decreaseCommentCount(comment.getPostId()); // ★ -1
	        return;
	    }

	    // [케이스 B] 자식이 없는 경우 → 본인만 soft-delete
	    int n = commentRepository.deleteComment(commentId); // is_deleted='Y'
	    if (n == 0) {
	        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");
	    }

	    if (comment.getParentCommentId() == null) {
	        // 최상위(부모) 댓글 삭제: 줄 하나 사라짐 → -1
	        postRepository.decreaseCommentCount(comment.getPostId()); // ★ -1
	    } else {
	        // 대댓글 삭제: 줄 하나 사라짐 → -1
	        // 부모의 자식 수는 별도 유지(선택) → UI/플레이스홀더 로직 등에 사용
	        commentRepository.decreaseCommentCount(comment.getParentCommentId());
	        postRepository.decreaseCommentCount(comment.getPostId()); // ★ -1

	        //  "삭제된 부모의 마지막 자식" 삭제 시 추가 -1 하지 않음
	        //   → 부모는 이미 집계에서 제외 상태이므로 별도 감소 불필요
	    }
	}

	
	
	
	
	

}
