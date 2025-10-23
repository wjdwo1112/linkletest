package com.ggamakun.linkle.domain.club.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClubMemberDto {
	private Integer memberId;
	private String name;
	private String nickname;
	private String description;
	private String role;
	private String status;
	private String fileLink;
	private String joinedAt;
}
