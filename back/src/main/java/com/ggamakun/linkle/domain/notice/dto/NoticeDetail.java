package com.ggamakun.linkle.domain.notice.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class NoticeDetail {
	private Integer postId;
	private Integer clubId;
	private String Name;
	private String title;
	private String content;
	private String images;
	private String postType;
	private Integer createdBy;
	private Date createdAt;
	private String scope;
	private String isPinned;
	private String isDeleted;
	
}
