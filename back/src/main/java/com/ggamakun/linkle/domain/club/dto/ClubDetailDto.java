package com.ggamakun.linkle.domain.club.dto;

import lombok.Data;

@Data
public class ClubDetailDto {
	private Integer clubId;
	private Integer fileId;
	private String fileLink;
	private String clubName;
	private String description;
	private Integer categoryId;
	private String categoryName;
	private String region;
	private Integer maxMembers;
	private String openedAt;
}
