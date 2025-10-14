package com.ggamakun.linkle.domain.notice.dto;

import lombok.Data;

@Data
public class UpdateNoticeRequest {
	private String title;
	private String content;
	private String images;
	private String isPinned;
}
