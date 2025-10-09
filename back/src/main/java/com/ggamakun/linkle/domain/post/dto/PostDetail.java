package com.ggamakun.linkle.domain.post.dto;

import java.sql.Date;

import lombok.Data;

@Data

public class PostDetail {
	private Integer postId;
	private Integer clubId;
	private String clubName;
	private String title;
	private String content;
	private String images;
	private String postType;
	private String scope;
	private Integer createdBy;
	private Date createdAt;	
	private Integer viewCount;
	private Integer likeCount;
	private Integer commentCount;
	private String isPinned;
	private String isDeleted;
	
	private String authorName;
	private String authorNickName;
}
