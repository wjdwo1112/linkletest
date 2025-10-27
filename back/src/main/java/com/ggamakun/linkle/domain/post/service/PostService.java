package com.ggamakun.linkle.domain.post.service;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.domain.post.dto.CreatePostRequest;
import com.ggamakun.linkle.domain.post.dto.PostDetail;
import com.ggamakun.linkle.domain.post.dto.PostSummary;
import com.ggamakun.linkle.domain.post.dto.UpdatePostRequest;
import com.ggamakun.linkle.domain.post.entity.Post;
import com.ggamakun.linkle.domain.post.repository.IPostRepository;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService implements IPostService {

	private final IPostRepository postRepository;
	private final IClubRepository clubRepository;
	
	@Override
	public List<Post> listAll() {
		
		return postRepository.listAll();
	}

	@Override
	public List<PostSummary> listSummary() {
		
		return postRepository.listSummary();
	}

	@Override
	@Transactional(readOnly=false)
	public PostDetail getPost(Integer postId, boolean increase) {
		
		PostDetail dto = postRepository.findPostDetail(postId);
		if(dto == null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		
		//scope가 '회원'이면 동호회 멤버만 볼 수 있음
		if("MEMBER".equals(dto.getScope())) {
			Integer currentMemberId = getCurrentMemberId();
		
			//로그인 안한 경우
			if(currentMemberId == null) {
				throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"로그인이 필요합니다.");
			}
		
//			//동호회 회원인지 확인
//			int memberCount = clubRepository.isClubMember(dto.getClubId(), currentMemberId);
//			if(memberCount == 0) {
//				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 게시글은 동호회 멤버만 볼 수 있다.");
//			}
			boolean isMember = clubRepository.isClubMember(dto.getClubId(), currentMemberId) > 0;
	        //  
	        log.info("access check clubId={}, memberId={}, isMember={}",
	                dto.getClubId(), currentMemberId, isMember);

	        if (!isMember) {
	            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 게시글은 동호회 멤버만 볼 수 있다.");
	        }
		}
		//조회수 증가
		if (increase) {
		    postRepository.increaseViewCount(postId);
		    dto = postRepository.findPostDetail(postId); // 증가 반영된 최신값으로 교체
		}
		return dto;
	}

	@Override
	@Transactional
	public Integer insertPost(CreatePostRequest request) {
		
		return postRepository.insertPost(request);
	}

	@Override
	@Transactional
	public PostDetail updatePost(Integer postId, UpdatePostRequest request, Integer memberId) {
		//게시글 존재 여부 확인
		PostDetail post = postRepository.findPostDetail(postId);
		if(post == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
		}
		
		//작성자 본인 확인
		if(!post.getCreatedBy().equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"게시글 작성자만 수정할 수 있다");
		}
		
		//게시글 수정
		int updated = postRepository.updatePost(postId, request,memberId);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		}
		return postRepository.findPostDetail(postId);
	}

	@Override
	@Transactional
	public void deletePost(Integer postId, Integer memberId) {
		//게시글 존재 여부 확인
		PostDetail post = postRepository.findPostDetail(postId);
		if(post == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"게시글을 찾을 수 없다.");
		}
		
		//작성자 본인 확인
		if(!post.getCreatedBy().equals(memberId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"게시글 작성자만 삭제할 수 있다");
		}
		
		//게시글 삭제
		int deleted = postRepository.deletePost(postId, memberId);
		if(deleted == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"게시글 삭제에 실패했다.");
		}
		
	}
	
	
	// 현재 로그인한 사용자 ID 가져오기
	private Integer getCurrentMemberId() {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
				CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
				return userDetails.getMember().getMemberId();
			}
		} catch (Exception e) {
			log.warn("현재 로그인 사용자 정보를 가져올 수 없습니다.", e);
		}
		return null;
	}
	
	

	
	


}
