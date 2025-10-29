package com.ggamakun.linkle.domain.club.service;

import java.util.List;

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

public interface IClubService {

	List<ClubSummary> getJoinedClubs(Integer memberId);
	
	// 동호회 생성
	Club createClub(CreateClubRequestDto request, Integer memberId);
	
	// 동호회 승인된 회원 수 조회
	int getApprovedMemberCount(Integer clubId);

	//동호회 상세 조회
	ClubDetailDto getClubDetail(Integer clubId);

	// 동호회 수정
	void updateClub(Integer clubId, UpdateClubRequestDto request, Integer memberId);

	// 동호회 삭제
	void deleteClub(Integer clubId, Integer memberId);
	
	// 대시보드 통계 조회
	List<MonthlyAttendanceDto> getMonthlyAttendance(Integer clubId);
	List<AgeDistributionDto> getAgeDistribution(Integer clubId);
	GenderRatioDto getGenderRatio(Integer clubId);
	List<QuarterlyJoinDto> getQuarterlyJoinStats(Integer clubId);
	
	// 동호회 검색
	List<SearchClubDto> searchClubs(String keyword);

	// 동호회 추천 - 카테고리 기반
	List<RecommendClubDto> recommendByCategory(Integer memberId);

	// 동호회 추천 - 지역 기반
	List<RecommendClubDto> recommendByRegion(Integer memberId);

	// 동호회 추천 - 복합 (카테고리 + 지역)
	List<RecommendClubDto> recommendByCombined(Integer memberId);
	
	// 최근 생성 동호회 조회 (메인용 - 3개)
	List<RecommendClubDto> getRecentClubs();

	// 최근 생성 동호회 조회 (더보기용 - 무한 스크롤)
	List<RecommendClubDto> getRecentClubsAll(Integer size, Integer cursor);

	// 카테고리별 동호회 조회 (메인용 - 3개)
	List<RecommendClubDto> getClubsByCategory(Integer categoryId);

	// 카테고리별 동호회 조회 (더보기용 - 무한 스크롤)
	List<RecommendClubDto> getClubsByCategoryAll(Integer categoryId, Integer size, Integer cursor);

	// 동호회 회원 목록 조회
	List<ClubMemberDto> getClubMembers(Integer clubId);
}
