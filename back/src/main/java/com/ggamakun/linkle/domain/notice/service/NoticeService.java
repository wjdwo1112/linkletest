package com.ggamakun.linkle.domain.notice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.repository.IClubMemberRepository;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.domain.notice.dto.CreateNoticeRequest;
import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.dto.UpdateNoticeRequest;
import com.ggamakun.linkle.domain.notice.repository.INoticeRepository;
import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.service.NotificationService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {
	private final INoticeRepository noticeRepository;
	private final IClubRepository clubRepository;
	private final IClubMemberRepository clubMemberRepository;
	private final NotificationService notificationService;

	@Override
	public List<NoticeSummary> getPinned() {
		
		return noticeRepository.getPinned();
	}

	@Override
	public List<NoticeSummary> noticeList() {
		
		return noticeRepository.noticeList();
	}
	
	//동호회 공지사항 목록 조회
	@Override
	public List<NoticeSummary> getNoticesByClubId(Integer clubId) {
		
		return noticeRepository.getNoticesByClubId(clubId);
	}
	
	@Transactional
	@Override
	public NoticeDetail getNotice(Integer postId, boolean increase) {
		NoticeDetail dto = noticeRepository.findNoticeDetail(postId);
		if(dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		
		Integer currentMemberId = getCurrentMemberId();
		
		if(currentMemberId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다");
		}
		
		boolean isMember = clubRepository.isClubMember(dto.getClubId(), currentMemberId)>0;
		if (!isMember) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 공지사항은 동호회 멤버만 볼 수 있습니다.");
		}
		
		//조회수 증가
		if (increase) {
			noticeRepository.increaseViewCount(postId);
			dto = noticeRepository.findNoticeDetail(postId); // 증가 반영된 최신값으로 교체
		}
		return dto;
	}
	
	//공지사항 등록
	@Override
	@Transactional
	public Integer insertNotice(CreateNoticeRequest request) {
		String memberRole = clubRepository.getMemberRole(request.getClubId(), request.getCreatedBy());
		if(memberRole == null) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"해당 동호회의 회원이 아닙니다.");
		}
		
		if(!"LEADER".equals(memberRole) && "MANAGER".equals(memberRole)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "공지사항은 모임장과 운영진만 등록할 수 있습니다" );
			
		}
		
		Integer postId = noticeRepository.insertNotice(request);
		
		//동호회 회원에게 알림 
		List<ClubMemberDto> members = clubMemberRepository.findMembersByClubId(request.getClubId());
		if(members != null && !members.isEmpty()) {
			Club club = clubRepository.findById(request.getClubId());
	        String clubName = (club != null) ? club.getName() : "동호회";
	        
	        for(ClubMemberDto member : members) {
	        	//작성자 본인에게는 알림 발송 안함
	        	if(member.getMemberId().equals(request.getCreatedBy())) {
	        		continue;
	        	}
	        	notificationService.sendNotification(
						CreateNotificationRequestDto.builder()
							.receiverId(member.getMemberId())
							.title("새 공지사항이 등록되었습니다")
							.content(clubName + " - " + request.getTitle())
							.linkUrl("/clubs/" + request.getClubId() + "/notice")
							.createdBy(request.getCreatedBy())
							.build()
					);
	        }
	        log.info("공지사항 알림 발송 완료 - postId: {}", postId);
	        
		}
		log.info("공지사항 등록 완료 - postId: {}, clubId: {}", postId, request.getClubId());
		return postId;
		
	}

	@Override
	@Transactional
	//공지사항 수정
	public NoticeDetail updateNotice(Integer postId, UpdateNoticeRequest request, Integer memberId) {
		NoticeDetail notice = noticeRepository.findNoticeDetail(postId);
		if(notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}
		
		boolean isAuthor = notice.getCreatedBy().equals(memberId);
		String memberRole = clubRepository.getMemberRole(notice.getClubId(), memberId);
		boolean isManager = "LEADER".equals(memberRole)|| "MANAGER".equals(memberRole);
		
		if(!isAuthor && !isManager) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"운영진만 수정할 수 있다");
		}
		
		int updated = noticeRepository.updateNotice(postId, request, memberId);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"notice not found");
		}
		
		 log.info("공지사항 수정 완료 - postId: {}, title: {}", postId, request.getTitle());
		 
		return noticeRepository.findNoticeDetail(postId);
		
		
	}
	
	@Override
	@Transactional
	//공지사항 상단 고정/해제 토글
	public void togglePin(Integer postId, Integer memberId) {
		NoticeDetail notice = noticeRepository.findNoticeDetail(postId);
		if(notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}
		
		//모임장 또는 운영진만 가능
		String memberRole = clubRepository.getMemberRole(notice.getClubId(), memberId);
		boolean isManager = "LEADER".equals(memberRole) || "MANAGER".equals(memberRole);
		
		if(!isManager) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "운영진만 사용할 수 있습니다");
		}
		
		//현재 고정 상태 확인
		String currentPinned = notice.getIsPinned();
		String newPinned = "Y".equals(currentPinned) ? "N" : "Y";
		
		int updated = noticeRepository.togglePin(postId, newPinned);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "고정 상태 변경에 실패했습니다.");
		}
		
		log.info("공지사항 고정 상태 변경 완료 - postId: {}", postId);
	}

	@Override
	@Transactional
	//공지사항 삭제
	public void deleteNotice(Integer postId, Integer memberId) {
		NoticeDetail notice = noticeRepository.findNoticeDetail(postId);
		if(notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}
		
		boolean isAuthor = notice.getCreatedBy().equals(memberId);
		String memberRole = clubRepository.getMemberRole(notice.getClubId(), memberId);
		boolean isManager = "LEADER".equals(memberRole)|| "MANAGER".equals(memberRole);
		
		if(!isAuthor && !isManager) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"운영진만 수정할 수 있다");
		}
		
		int deleted = noticeRepository.deleteNotice(postId, memberId);
		if(deleted == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"공지사항 삭제에 실패");
		}
		
		log.info("공지사항 삭제 완료 - postId: {}, clubId: {}", postId, notice.getClubId());
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
