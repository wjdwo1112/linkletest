package com.ggamakun.linkle.domain.like.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponseDto {
	private boolean liked;
	private Integer likeCount;
}
