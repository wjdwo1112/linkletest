package com.ggamakun.linkle.domain.club.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.club.dto.AgeDistributionDto;
import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.dto.GenderRatioDto;
import com.ggamakun.linkle.domain.club.dto.MonthlyAttendanceDto;
import com.ggamakun.linkle.domain.club.dto.QuarterlyJoinDto;
import com.ggamakun.linkle.domain.club.dto.RecommendClubDto;
import com.ggamakun.linkle.domain.club.dto.SearchClubDto;
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
public class ClubService implements IClubService {

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
	public List<MonthlyAttendanceDto> getMonthlyAttendance(Integer clubId) {
		log.info("동호회 월별 참여율 조회 - 동호회 ID: {}", clubId);
		return clubRepository.getMonthlyAttendance(clubId);
	}
	
	@Override
	public List<AgeDistributionDto> getAgeDistribution(Integer clubId) {
		log.info("동호회 나이대 분포 조회 - 동호회 ID: {}", clubId);
		return clubRepository.getAgeDistribution(clubId);
	}
	
	@Override
	public GenderRatioDto getGenderRatio(Integer clubId) {
		log.info("동호회 성비 조회 - 동호회 ID: {}", clubId);
		return clubRepository.getGenderRatio(clubId);
	}
	
	@Override
	public List<QuarterlyJoinDto> getQuarterlyJoinStats(Integer clubId) {
		log.info("동호회 분기별 가입자 수 조회 - 동호회 ID: {}", clubId);
		return clubRepository.getQuarterlyJoinStats(clubId);
	}
	
	@Override
	public List<SearchClubDto> searchClubs(String keyword) {
	    if (keyword == null || keyword.trim().isEmpty()) {
	        return new ArrayList<>();
	    }
	    return clubRepository.searchClubs(keyword.trim());
	}

	@Override
	public List<RecommendClubDto> recommendByCategory(Integer memberId) {
	    log.info("카테고리 기반 동호회 추천 - 회원 ID: {}", memberId);
	    return clubRepository.recommendByCategory(memberId);
	}

	@Override
	public List<RecommendClubDto> recommendByRegion(Integer memberId) {
	    log.info("지역 기반 동호회 추천 - 회원 ID: {}", memberId);
	    return clubRepository.recommendByRegion(memberId);
	}

	@Override
	public List<RecommendClubDto> recommendByCombined(Integer memberId) {
	    log.info("복합 동호회 추천 - 회원 ID: {}", memberId);
	    return clubRepository.recommendByCombined(memberId);
	}
	
	@Override
	public List<RecommendClubDto> getRecentClubs() {
	    log.info("최근 생성 동호회 조회 (메인용 - 3개)");
	    return clubRepository.findRecentClubs();
	}
	
	@Override
	public List<RecommendClubDto> getRecentClubsAll(Integer size, Integer cursor) {
	    log.info("최근 생성 동호회 조회 (더보기용) - size: {}, cursor: {}", size, cursor);
	    if (size == null) {
	        size = 10;
	    }
	    return clubRepository.findRecentClubsAll(size, cursor);
	}
	
	@Override
	public List<RecommendClubDto> getClubsByCategory(Integer categoryId) {
	    log.info("카테고리별 동호회 조회 (메인용 - 3개) - 카테고리 ID: {}", categoryId);
	    return clubRepository.findClubsByCategory(categoryId);
	}
	
	@Override
	public List<RecommendClubDto> getClubsByCategoryAll(Integer categoryId, Integer size, Integer cursor) {
	    log.info("카테고리별 동호회 조회 (더보기용) - 카테고리 ID: {}, size: {}, cursor: {}", categoryId, size, cursor);
	    if (size == null) {
	        size = 10;
	    }
	    return clubRepository.findClubsByCategoryAll(categoryId, size, cursor);
	}
	
	@Override
	public List<ClubMemberDto> getClubMembers(Integer clubId) {
		return clubRepository.findMembersByClubId(clubId);
	}
	
	
	
	//인기 동호회 조회 
	@Override
	public List<RecommendClubDto> getPopularClubs(int size, Integer cursor) {
	    return clubRepository.findPopularClubs(size, cursor);
	}

	
	//급성장 동호회 조회
	@Override
	public List<RecommendClubDto> getGrowingClubs(int size, Integer cursor) {
	    return clubRepository.findGrowingClubs(size, cursor);
	}

	
	//활발한 동호회 조회
	@Override
	public List<RecommendClubDto> getActiveClubs(int size, Integer cursor) {
	    return clubRepository.findActiveClubs(size, cursor);
	}
}
