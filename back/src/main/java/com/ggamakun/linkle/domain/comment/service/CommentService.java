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
import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.service.NotificationService;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {
	private final ICommentRepository commentRepository;
	private final IPostRepository postRepository;
	private final NotificationService notificationService;
	
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
			
			//대댓글 작성시 부모 댓글 작성자에게 알림
			CommentDto parentComment = commentRepository.findById(request.getParentCommentId());
			if(parentComment != null && !parentComment.getCreatedBy().equals(request.getCreatedBy())) {
				PostDetail post = postRepository.findPostDetail(request.getPostId());
				
				log.info("대댓글 알림 발송 - receiverId: {}, postId: {}", 
				         parentComment.getCreatedBy(), request.getPostId());
				
				notificationService.sendNotification(
						CreateNotificationRequestDto.builder()
							.receiverId(parentComment.getCreatedBy())
							.title("댓글에 답글이 달렸습니다")
							.content(post.getTitle() + " 게시글의 댓글에 답글이 달렸습니다.")
							.linkUrl("/community/posts/" + request.getPostId())
							.createdBy(request.getCreatedBy())
							.build()
				);
			}
		}	else {
			// 일반 댓글 작성 시 게시글 작성자에게 알림
				PostDetail post = postRepository.findPostDetail(request.getPostId());
				if (post != null && !post.getCreatedBy().equals(request.getCreatedBy())) {
					log.info("댓글 알림 발송 - receiverId: {}, postId: {}", 
					         post.getCreatedBy(), request.getPostId());
					
					notificationService.sendNotification(
						CreateNotificationRequestDto.builder()
							.receiverId(post.getCreatedBy())
							.title("새 댓글이 달렸습니다")
							.content(post.getTitle() + " 게시글에 댓글이 달렸습니다.")
							.linkUrl("/community/posts/" + request.getPostId())
							.createdBy(request.getCreatedBy())
							.build()
					);
				}
		}
		
		//게시글의 댓글 수 증가
		postRepository.increaseCommentCount(request.getPostId());
		log.info("작성 완료 - postId: {}", request.getPostId());
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
		int updated = commentRepository.updateComment(commentId, content, memberId);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 수정 실패");
		}
		
		log.info("댓글 수정 완료 - commentId: {}, postId: {}", commentId, comment.getPostId());
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
	    	log.info("이미 삭제된 댓글 - commentId: {}", commentId);
	        return;
	    }

	    // 4) 자식(대댓글) 존재 여부
	    int children = commentRepository.countChildren(commentId);

	    if (children > 0) {
	        // [케이스 A] 부모 댓글에 자식이 남아있는 상태에서 부모 삭제
	        // - 부모를 soft-delete(내용 NULL, is_deleted='Y')로 처리
	        // - 집계에서 부모는 제외되므로 게시글 총 댓글 수 -1
	        int n = commentRepository.deleteComments(commentId, memberId); // content=null, is_deleted='Y'
	        if (n == 0) {
	            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");
	        }
	        postRepository.decreaseCommentCount(comment.getPostId()); //  -1
	        log.info("댓글 삭제 완료  - commentId: {}, postId: {}", commentId, comment.getPostId());
	        return;
	    }

	    // [케이스 B] 자식이 없는 경우 → 본인만 soft-delete
	    int n = commentRepository.deleteComment(commentId, memberId); // is_deleted='Y'
	    if (n == 0) {
	        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "댓글 삭제에 실패했습니다");
	    }

	    if (comment.getParentCommentId() == null) {
	        // 최상위(부모) 댓글 삭제: 줄 하나 사라짐 → -1
	        postRepository.decreaseCommentCount(comment.getPostId()); //  -1
	        log.info("댓글 삭제 완료 (댓글) - commentId: {}, postId: {}", commentId, comment.getPostId());
	    } else {
	        // 대댓글 삭제: 줄 하나 사라짐 → -1
	        // 부모의 자식 수는 별도 유지(선택) → UI/플레이스홀더 로직 등에 사용
	        commentRepository.decreaseCommentCount(comment.getParentCommentId());
	        postRepository.decreaseCommentCount(comment.getPostId()); //  -1
	        log.info("댓글 삭제 완료 (대댓글) - commentId: {}, parentCommentId: {}, postId: {}", 
	                 commentId, comment.getParentCommentId(), comment.getPostId());
	        //  "삭제된 부모의 마지막 자식" 삭제 시 추가 -1 하지 않음
	        //   → 부모는 이미 집계에서 제외 상태이므로 별도 감소 불필요
	    }
	}

	
	
	
	
	

}
