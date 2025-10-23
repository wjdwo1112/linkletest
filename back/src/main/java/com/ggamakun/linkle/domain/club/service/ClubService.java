package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.dto.UpdateClubRequestDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.global.exception.BadRequestException;
import com.ggamakun.linkle.global.exception.ForbiddenException;
import com.ggamakun.linkle.global.exception.NotFoundException;

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
	
	@Override
	@Transactional
	public void updateClub(Integer clubId, UpdateClubRequestDto request, Integer memberId) {
		log.info("동호회 수정 시작 - 동호회 ID: {}, 회원 ID: {}", clubId, memberId);
		
		// 동호회 존재 여부 확인
		Club club = clubRepository.findById(clubId);
		if (club == null) {
			throw new NotFoundException("동호회를 찾을 수 없습니다.");
		}
		
		// 동호회장 권한 확인
		String role = clubRepository.getMemberRole(clubId, memberId);
		if (!"LEADER".equals(role)) {
			throw new ForbiddenException("동호회장만 수정할 수 있습니다.");
		}
		
		request.setUpdatedBy(memberId);
		
		int updated = clubRepository.updateClub(clubId, request);
		if (updated == 0) {
			throw new BadRequestException("동호회 수정에 실패했습니다.");
		}
		
		log.info("동호회 수정 완료 - 동호회 ID: {}", clubId);
	}

	@Override
	@Transactional
	public void deleteClub(Integer clubId, Integer memberId) {
		log.info("동호회 삭제 시작 - 동호회 ID: {}, 회원 ID: {}", clubId, memberId);
		
		// 동호회 존재 여부 확인
		Club club = clubRepository.findById(clubId);
		if (club == null) {
			throw new NotFoundException("동호회를 찾을 수 없습니다.");
		}
		
		// 동호회장 권한 확인
		String role = clubRepository.getMemberRole(clubId, memberId);
		if (!"LEADER".equals(role)) {
			throw new ForbiddenException("동호회장만 삭제할 수 있습니다.");
		}
		
		// 승인된 회원 수 확인 (동호회장 1명만 있어야 함)
		int approvedMemberCount = clubRepository.getApprovedMemberCount(clubId);
		if (approvedMemberCount > 1) {
			throw new BadRequestException("동호회에 가입한 회원이 있어 삭제할 수 없습니다.");
		}
		
		int deleted = clubRepository.deleteClub(clubId, memberId);
		if (deleted == 0) {
			throw new BadRequestException("동호회 삭제에 실패했습니다.");
		}
		
		log.info("동호회 삭제 완료 - 동호회 ID: {}", clubId);
	}


	@Override
	public List<ClubMemberDto> getClubMembers(Integer clubId) {
		return clubRepository.findMembersByClubId(clubId);
	}

}
