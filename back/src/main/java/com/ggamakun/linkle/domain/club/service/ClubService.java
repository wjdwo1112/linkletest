package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubService implements IClubService{

	private final IClubRepository clubRepository;
	
	@Override
	public List<ClubSummary> getJoinedClubs(Integer memberId) {
		
		return clubRepository.findClubsByMemberId(memberId);
	}

	@Override
	@Transactional
	public Club createClub(CreateClubRequestDto request, Integer memberId) {
		log.info("동호회 생성 시작 - 회원 ID: {}, 동호회명: {}", memberId, request.getName());
		
		request.setCreatedBy(memberId);
		
		int result = clubRepository.insertClub(request);
		
		if (result == 0) {
			throw new RuntimeException("동호회 생성에 실패했습니다.");
		}
		
		Integer clubId = request.getClubId();
		
		clubRepository.insertClubMember(clubId, memberId);
		
		log.info("동호회 생성 완료 - 동호회 ID: {}", clubId);
		
		return clubRepository.findById(clubId);
	}
	
	@Override
	public int getApprovedMemberCount(Integer clubId) {
		return clubRepository.getApprovedMemberCount(clubId);
	}

	@Override
	public ClubDetailDto getClubDetail(Integer clubId) {
		return clubRepository.findDetailById(clubId);
	}

}
