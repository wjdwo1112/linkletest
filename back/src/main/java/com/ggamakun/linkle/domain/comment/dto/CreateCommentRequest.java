package com.ggamakun.linkle.domain.comment.dto;

import lombok.Data;

@Data
public class CreateCommentRequest {
	
	private Integer postId;
	private Integer parentCommentId;
	private String content;
	private Integer createdBy;
}
