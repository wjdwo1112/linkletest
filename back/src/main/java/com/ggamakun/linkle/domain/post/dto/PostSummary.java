package com.ggamakun.linkle.domain.post.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class PostSummary {
	
	private Integer postId;
	private String clubName;
	private String images;
	private String title;
	private Integer likeCount;
	private Integer commentCount;
	private Date createdAt;
}
