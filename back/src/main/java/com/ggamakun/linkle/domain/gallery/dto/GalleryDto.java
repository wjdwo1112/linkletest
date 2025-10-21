package com.ggamakun.linkle.domain.gallery.dto;

import lombok.Data;

@Data
public class GalleryDto {
	private Integer galleryId;
	private String clubName;
	private Integer clubId;
	private String nickname;
	private String scope;
	private String fileId;
	private String fileLink;
	private Integer createdBy;
	private String createdAt;
	private Integer likeCount;
	private String memberProfileImage;
	private String clubProfileImage;
	
}
