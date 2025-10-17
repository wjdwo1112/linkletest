package com.ggamakun.linkle.domain.comment.dto;


import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class CommentDto {
	private Integer commentId;
	private Integer postId;
	private Integer parentCommentId;
	private String content;
	private Integer createdBy;
	private String createdAt;
	private Integer likeCount;
	private Integer commentCount;
	private String authorName;
	private String authorNickname;
	private Integer profileId;
	private String profileUrl;
	private String isDeleted;
	private List<CommentDto> replies = new ArrayList<>();
}

