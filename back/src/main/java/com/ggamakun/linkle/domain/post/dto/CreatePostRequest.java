package com.ggamakun.linkle.domain.post.dto;

import lombok.Data;

@Data
public class CreatePostRequest {
	
	private Integer clubId;
	private String title;
	private String content;
	private String images;
	private String postType;
	private String scope;
	private Integer createdBy;

}
