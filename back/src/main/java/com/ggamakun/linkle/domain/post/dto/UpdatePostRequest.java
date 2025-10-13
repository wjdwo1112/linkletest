package com.ggamakun.linkle.domain.post.dto;

import lombok.Data;

@Data
public class UpdatePostRequest {

	private String title;
	private String content;
	private String images;
	private String scope;
}
