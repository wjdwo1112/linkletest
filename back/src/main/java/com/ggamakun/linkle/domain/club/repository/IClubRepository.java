package com.ggamakun.linkle.domain.club.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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

@Mapper
public interface IClubRepository {

	//회원이 가입한 동호회 목록 조회
	List<ClubSummary> findClubsByMemberId(@Param("memberId") Integer memberId);

	//특정 동호회의 회원인지 확인
	int isClubMember(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
	
	//특정 동호회에서 회원의 역할 조회
	String getMemberRole(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
	
	// 동호회 생성
	int insertClub(CreateClubRequestDto request);

	// 동호회 회원 추가 (생성자를 리더로)
	int insertClubMember(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);

	// 동호회 조회
	Club findById(Integer clubId);
	
	// 동호회 승인된 회원 수 조회
	int getApprovedMemberCount(@Param("clubId") Integer clubId);

	//동호회 상세 조회
	ClubDetailDto findDetailById(@Param("clubId") Integer clubId);
	
	// 동호회 수정
	int updateClub(@Param("clubId") Integer clubId, @Param("request") UpdateClubRequestDto request);

	// 동호회 삭제 (소프트 삭제)
	int deleteClub(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);

	//동호회 회원 목록 조회
	List<ClubMemberDto> findMembersByClubId(Integer clubId);
	
	// 대시보드 통계 조회
	List<MonthlyAttendanceDto> getMonthlyAttendance(@Param("clubId") Integer clubId);
	List<AgeDistributionDto> getAgeDistribution(@Param("clubId") Integer clubId);
	GenderRatioDto getGenderRatio(@Param("clubId") Integer clubId);
	List<QuarterlyJoinDto> getQuarterlyJoinStats(@Param("clubId") Integer clubId);
	
	// 동호회 검색
	List<SearchClubDto> searchClubs(@Param("keyword") String keyword);
	
	// 동호회 추천 - 카테고리 기반
	List<RecommendClubDto> recommendByCategory(@Param("memberId") Integer memberId);

	// 동호회 추천 - 지역 기반
	List<RecommendClubDto> recommendByRegion(@Param("memberId") Integer memberId);

	// 동호회 추천 - 복합 (카테고리 + 지역)
	List<RecommendClubDto> recommendByCombined(@Param("memberId") Integer memberId);
	
	// 최근 생성 동호회 조회 (메인용 - 3개)
	List<RecommendClubDto> findRecentClubs();

	// 최근 생성 동호회 조회 (더보기용 - 무한 스크롤)
	List<RecommendClubDto> findRecentClubsAll(@Param("size") Integer size, @Param("cursor") Integer cursor);

	// 카테고리별 동호회 조회 (메인용 - 3개)
	List<RecommendClubDto> findClubsByCategory(@Param("categoryId") Integer categoryId);

	// 카테고리별 동호회 조회 (더보기용 - 무한 스크롤)
	List<RecommendClubDto> findClubsByCategoryAll(@Param("categoryId") Integer categoryId, @Param("size") Integer size, @Param("cursor") Integer cursor);
	
	
    //인기 동호회 조회
    List<RecommendClubDto> findPopularClubs(@Param("size") int size, @Param("cursor") Integer cursor);
    
    //급성장 동호회 조회 
    List<RecommendClubDto> findGrowingClubs(@Param("size") int size, @Param("cursor") Integer cursor);
    
    //활발한 동호회 조회
    List<RecommendClubDto> findActiveClubs(@Param("size") int size, @Param("cursor") Integer cursor);
	
}
