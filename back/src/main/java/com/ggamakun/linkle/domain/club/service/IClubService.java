package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.entity.Club;

public interface IClubService {

	List<ClubSummary> getJoinedClubs(Integer memberId);
	
	// 동호회 생성
	Club createClub(CreateClubRequestDto request, Integer memberId);
	
	// 동호회 승인된 회원 수 조회
	int getApprovedMemberCount(Integer clubId);

	//동호회 상세 조회
	ClubDetailDto getClubDetail(Integer clubId);

}
