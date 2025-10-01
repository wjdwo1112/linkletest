package com.ggamakun.linkle.domain.notice.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;

@Mapper
public interface INoticeRepository {

	List<NoticeSummary> getPinned();

	List<NoticeSummary> noticeList();
	
	void increaseViewCount(Integer postId);

	NoticeDetail findNoticeDetail(Integer postId);

}
