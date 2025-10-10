package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClubService implements IClubService{

	private final IClubRepository clubRepository;
	
	@Override
	public List<ClubSummary> getJoinedClubs(Integer memberId) {
		// TODO Auto-generated method stub
		return clubRepository.findClubsByMemberId(memberId);
	}

}
