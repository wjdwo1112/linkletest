package com.ggamakun.linkle.domain.club.dto;

import lombok.Data;

@Data
public class ClubSummary {
	private Integer clubId;
	private String name;
	private String description;
	private String status;
	private String role;
}
