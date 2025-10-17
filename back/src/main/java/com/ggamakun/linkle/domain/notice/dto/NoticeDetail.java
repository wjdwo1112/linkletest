package com.ggamakun.linkle.domain.notice.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class NoticeDetail {
	private Integer postId;
	private Integer clubId;
	private String clubName;
	private String title;
	private String content;
	private String images;
	private String isPinned;
	
	private Integer createdBy;
	private String authorName;
	private String authorNickname;
	private Integer profileId;
	private String profileUrl;
	
	private String createdAt;
	private Integer viewCount;
	
	
}
