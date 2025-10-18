package com.ggamakun.linkle.domain.gallery.dto;

import lombok.Data;

@Data
public class CreateGalleryRequest {
	private Integer clubId;
	private String clubName;
	private Integer fileId;
	private String scope;
	private Integer createdBy;
}
