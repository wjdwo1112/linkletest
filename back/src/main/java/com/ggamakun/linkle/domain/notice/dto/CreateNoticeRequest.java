package com.ggamakun.linkle.domain.notice.dto;

import lombok.Data;

@Data
public class CreateNoticeRequest {
	private Integer clubId;
	private String title;
	private String content;
	private String images;
	private String isPinned;
	private Integer createdBy;
}
