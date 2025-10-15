package com.ggamakun.linkle.domain.notice.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.notice.dto.CreateNoticeRequest;
import com.ggamakun.linkle.domain.notice.dto.NoticeDetail;
import com.ggamakun.linkle.domain.notice.dto.NoticeSummary;
import com.ggamakun.linkle.domain.notice.dto.UpdateNoticeRequest;

@Mapper
public interface INoticeRepository {

	List<NoticeSummary> getPinned();

	List<NoticeSummary> noticeList();
	
	void increaseViewCount(Integer postId);

	NoticeDetail findNoticeDetail(@Param("postId") Integer postId);

	Integer insertNotice(CreateNoticeRequest request);
	
	int updateNotice(@Param("postId") Integer postId, @Param("request") UpdateNoticeRequest request);

	int deleteNotice(Integer postId);

	List<NoticeSummary> getNoticesByClubId(@Param("clubId") Integer clubId);

	int togglePin(@Param("postId") Integer postId, @Param("isPinned") String isPinned);

}
