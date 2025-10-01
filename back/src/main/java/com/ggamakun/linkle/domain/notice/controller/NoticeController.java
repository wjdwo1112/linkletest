package com.ggamakun.linkle.domain.notice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.service.INoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notice")
public class NoticeController {
	private final INoticeService noticeService;
	
	@GetMapping("/ispinned")
	public List<NoticeSummary> getPinned(){
		return noticeService.getPinned();
	}
	
	@GetMapping("/list")
	public List<NoticeSummary> noticeList(){
		return noticeService.noticeList();
	}
	

	@GetMapping("/{postid}")
	public NoticeDetail getNotice(@PathVariable("postid") Integer postId, boolean increase) {
		return noticeService.getNotice(postId,increase);
	}
}
