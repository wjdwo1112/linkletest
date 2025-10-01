package com.ggamakun.linkle.domain.notice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.repository.INoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {
	private final INoticeRepository noticeRepository;

	@Override
	public List<NoticeSummary> getPinned() {
		
		return noticeRepository.getPinned();
	}

	@Override
	public List<NoticeSummary> noticeList() {
		
		return noticeRepository.noticeList();
	}

	@Override
	public NoticeDetail getNotice(Integer postId, boolean increase) {
		NoticeDetail dto = noticeRepository.findNoticeDetail(postId);
		if(dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"post not found");
		if(increase) {
			noticeRepository.increaseViewCount(postId);
		}
		return dto;
	}
}
