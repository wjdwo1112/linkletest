package com.ggamakun.linkle.domain.post.dto;

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
	private String createdAt;	
	private Integer viewCount;
	private Integer likeCount;
	private Integer commentCount;
	private String isPinned;
	private String isDeleted;
	
	private String authorName;
	private String authorNickname;
	private Integer profileId;
	private String profileUrl;
}
