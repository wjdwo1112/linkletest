package com.ggamakun.linkle.domain.post.entity;

import java.sql.Date;
import lombok.Data;

@Data
public class Post {
	
	private Integer postId;
	private Integer clubId;
	private String title;
	private String content;
	private String images;
	private String postType;
	private String scope;
	private Integer createdBy;
	private Date createdAt;
	private Integer updatedBy;
	private Date updatedAt;
	private Integer viewCount;
	private Integer likeCount;
	private Integer commentCount;
	private String isPinned;
	private String isDeleted;
	
}
