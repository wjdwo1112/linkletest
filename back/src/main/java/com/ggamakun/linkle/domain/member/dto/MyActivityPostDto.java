package com.ggamakun.linkle.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MyActivityPostDto {
	private Integer postId;
	private Integer clubId;
	private String title;
	private String content;
	private Integer viewCount;
	private Integer likeCount;
	private Integer commentCount;
	private String createdAt;
	private String authorNickname;
	private String clubName;
	private Integer commentId;
	private String commentContent;
	private String commentedAt;
	private Integer likeId;
	private String likedAt;
}
