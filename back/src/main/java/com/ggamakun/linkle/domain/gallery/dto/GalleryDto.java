package com.ggamakun.linkle.domain.gallery.dto;

import lombok.Data;

@Data
public class GalleryDto {
	private Integer postId;
	private Integer clubId;
	private String title;
	private String content;
	private String images;
	private String postType;
	private String scope;
	private Integer createdBy;
	private String createdAt;
	private Integer viewCount;
	private Integer likeCount;
	
}
