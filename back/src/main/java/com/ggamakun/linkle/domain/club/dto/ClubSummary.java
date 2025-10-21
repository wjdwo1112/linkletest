package com.ggamakun.linkle.domain.club.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class ClubSummary {
	private Integer clubId;
	private String name;
	private String description;
	private String status;
	private String role;
	private Timestamp joinedAt;
	private String fileLink;
}
