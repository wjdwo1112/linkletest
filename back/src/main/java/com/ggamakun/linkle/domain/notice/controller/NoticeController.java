package com.ggamakun.linkle.domain.notice.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.notice.dto.CreateNoticeRequest;
import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.dto.UpdateNoticeRequest;
import com.ggamakun.linkle.domain.notice.service.INoticeService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notices")
public class NoticeController {
	private final INoticeService noticeService;
	
	//고정 공지사항 목록조회
	@GetMapping("/ispinned")
	public List<NoticeSummary> getPinned(){
		return noticeService.getPinned();
	}
	
	@GetMapping("/list")
	public List<NoticeSummary> noticeList(){
		return noticeService.noticeList();
	}
	
	//동호회 공지사항 조회
	@GetMapping("/club/{clubid}")
	public List<NoticeSummary> getNoticesByClubId(@PathVariable("clubid") Integer clubId){
		return noticeService.getNoticesByClubId(clubId);
	}
	
	//공지사항 상세조회
	@GetMapping("/{postid}")
	public NoticeDetail getNotice(@PathVariable("postid") Integer postId) {
		return noticeService.getNotice(postId,true);
	}
	
	//공지사항 등록
	@PostMapping("")
	public ResponseEntity<?> createNotice(@RequestBody CreateNoticeRequest request, 
										  @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails ){
		Integer memberId = userDetails.getMember().getMemberId();
		request.setCreatedBy(memberId);
		noticeService.insertNotice(request);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
	//공지사항 수정
	@PutMapping("/{postid}")
	public ResponseEntity<NoticeDetail> updateNotice(@PathVariable("postid") Integer postId, @RequestBody UpdateNoticeRequest request,
													 @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		NoticeDetail updated = noticeService.updateNotice(postId,request,memberId);
		
		return ResponseEntity.ok(updated);
	}
	
	//공지사항 고정/해제
	@PutMapping("/{postid}/pin")
	public ResponseEntity<Void> togglePin(@PathVariable("postid") Integer postId,
										  @Parameter(hidden=true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		noticeService.togglePin(postId,memberId);
		
		return ResponseEntity.ok().build();
	}
	
	//공지사항 삭제
	@DeleteMapping("/{postid}")
	public ResponseEntity<Void> deleteNotice(@PathVariable("postid") Integer postId,
											 @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		noticeService.deleteNotice(postId, memberId);
		
		return ResponseEntity.noContent().build();
	}
}
