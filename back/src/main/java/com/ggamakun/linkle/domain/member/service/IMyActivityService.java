package com.ggamakun.linkle.domain.member.service;

import java.util.List;

import com.ggamakun.linkle.domain.member.dto.MyActivityPostDto;

public interface IMyActivityService {

	List<MyActivityPostDto> getMyActivities(Integer memberId, String type);

}
