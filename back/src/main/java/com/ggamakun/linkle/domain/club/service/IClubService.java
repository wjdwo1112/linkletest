package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;

public interface IClubService {

	List<ClubSummary> getJoinedClubs(Integer memberId);

}
