package com.ggamakun.linkle.domain.comment.entity;

import java.sql.Date;

import lombok.Data;

@Data
public class Comment {
	private Integer commentId;
	private Integer postId;
	private Integer parentCommentId;
	private String content;
	private Integer createdBy;
	private Date createdAt;
	private Integer updatedBy;
	private Date updatedAt;
	private Integer likeCount;
	private Integer commentCount;
	private String isDeleted;
	
	private String authorName;
	private String authorNickname;
}
