package com.ggamakun.linkle.domain.notice.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class NoticeSummary {
	private Integer postId;
	private Integer clubId;
	private String title;
	private String content;
	private String nickname;
	private String postType;
	private String scope;
	private Integer createdBy;
	private Date createdAt;
	private Integer updatedBy;
	private Date upadatedAt;
	private Integer viewCount;
	private String isPinned;
	private String isDeleted;
}
