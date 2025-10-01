package com.ggamakun.linkle.domain.notice.service;

import java.util.List;

import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;

public interface INoticeService {

	List<NoticeSummary> getPinned();

	List<NoticeSummary> noticeList();

	NoticeDetail getNotice(Integer postId, boolean increase);

}
