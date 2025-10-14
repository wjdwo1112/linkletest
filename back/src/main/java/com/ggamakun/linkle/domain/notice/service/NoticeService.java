package com.ggamakun.linkle.domain.notice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.domain.notice.dto.CreateNoticeRequest;
import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.dto.UpdateNoticeRequest;
import com.ggamakun.linkle.domain.notice.repository.INoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {
	private final INoticeRepository noticeRepository;
	private final IClubRepository clubRepository;

	@Override
	public List<NoticeSummary> getPinned() {
		
		return noticeRepository.getPinned();
	}

	@Override
	public List<NoticeSummary> noticeList() {
		
		return noticeRepository.noticeList();
	}
	
	@Transactional
	@Override
	public NoticeDetail getNotice(Integer postId, boolean increase) {
		NoticeDetail dto = noticeRepository.findNoticeDetail(postId);
		if(dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		if(increase) {
			noticeRepository.increaseViewCount(postId);
		}
		return dto;
	}

	@Override
	public Integer insertNotice(CreateNoticeRequest request) {
		String memberRole = clubRepository.getMemberRole(request.getClubId(), request.getCreatedBy());
		if(memberRole == null) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"해당 동호회의 회원이 아닙니다.");
		}
		
		if(!"모임장".equals(memberRole) && "운영진".equals(memberRole)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "공지사항은 모임장과 운영진만 등록할 수 있습니다" );
			
		}
		return noticeRepository.insertNotice(request);
	}

	@Override
	@Transactional
	public NoticeDetail updateNotice(Integer postId, UpdateNoticeRequest request, Integer memberId) {
		NoticeDetail notice = noticeRepository.findNoticeDetail(postId);
		if(notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}
		
		boolean isAuthor = notice.getCreatedBy().equals(memberId);
		String memberRole = clubRepository.getMemberRole(notice.getClubId(), memberId);
		boolean isManager = "모임장".equals(memberRole)|| "운영진".equals(memberRole);
		
		if(!isAuthor && !isManager) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"운영진만 수정할 수 있다");
		}
		
		int updated = noticeRepository.updateNotice(postId, request);
		if(updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND,"notice not found");
		}
		return noticeRepository.findNoticeDetail(postId);
		
		
	}

	@Override
	public void deleteNotice(Integer postId, Integer memberId) {
		NoticeDetail notice = noticeRepository.findNoticeDetail(postId);
		if(notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}
		
		boolean isAuthor = notice.getCreatedBy().equals(memberId);
		String memberRole = clubRepository.getMemberRole(notice.getClubId(), memberId);
		boolean isManager = "모임장".equals(memberRole)|| "운영진".equals(memberRole);
		
		if(!isAuthor && !isManager) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,"운영진만 수정할 수 있다");
		}
		
		int deleted = noticeRepository.deleteNotice(postId);
		if(deleted == 0) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"공지사항 삭제에 실패");
		}
		
		
	}
}
