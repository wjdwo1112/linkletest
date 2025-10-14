package com.ggamakun.linkle.domain.notice.service;

import java.util.List;

import com.ggamakun.linkle.domain.notice.dto.CreateNoticeRequest;
import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.dto.UpdateNoticeRequest;

public interface INoticeService {

	List<NoticeSummary> getPinned();

	List<NoticeSummary> noticeList();

	NoticeDetail getNotice(Integer postId, boolean increase);

	Integer insertNotice(CreateNoticeRequest request);

	NoticeDetail updateNotice(Integer postId, UpdateNoticeRequest request, Integer memberId);

	void deleteNotice(Integer postId, Integer memberId);

}
