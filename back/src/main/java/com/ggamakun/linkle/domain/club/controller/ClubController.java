package com.ggamakun.linkle.domain.club.controller;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
import com.ggamakun.linkle.domain.club.service.IClubService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "동호회", description = "동호회 관련 API")
public class ClubController {
	
	private final IClubService clubService;

	@GetMapping("/clubs/joined")
	public ResponseEntity<List<ClubSummary>> getJoinedClubs(@AuthenticationPrincipal CustomUserDetails userDetails){

		Integer memberId = userDetails.getMember().getMemberId();

		List<ClubSummary> clubs = clubService.getJoinedClubs(memberId);
		return ResponseEntity.ok(clubs);
	}

	@GetMapping("/clubs/search")
	public ResponseEntity<List<SearchClubDto>> searchClubs(@RequestParam(value = "keyword", required = false) String keyword) {
	    List<SearchClubDto> results = clubService.searchClubs(keyword);
	    return ResponseEntity.ok(results);
	}

	@PostMapping("/clubs")
	public ResponseEntity<Club> createClub(
			@Valid @RequestBody CreateClubRequestDto request,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		Club club = clubService.createClub(request, memberId);
		return ResponseEntity.status(HttpStatus.CREATED).body(club);
	}
	
	@GetMapping("/clubs/{clubId:\\d+}/member-count")
	public ResponseEntity<Integer> getApprovedMemberCount(@PathVariable("clubId") Integer clubId) {
		int count = clubService.getApprovedMemberCount(clubId);
		return ResponseEntity.ok(count);
	}
	
	@GetMapping("/clubs/{clubId:\\d+}")
	public ResponseEntity<ClubDetailDto> getClubDetail(@PathVariable("clubId") Integer clubId) {
		ClubDetailDto club = clubService.getClubDetail(clubId);
		return ResponseEntity.ok(club);
	}
	
	@PutMapping("/clubs/{clubId:\\d+}")
	public ResponseEntity<Void> updateClub(
			@PathVariable("clubId") Integer clubId,
			@Valid @RequestBody UpdateClubRequestDto request,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		clubService.updateClub(clubId, request, memberId);
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/clubs/{clubId:\\d+}")
	public ResponseEntity<Void> deleteClub(
			@PathVariable("clubId") Integer clubId,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		clubService.deleteClub(clubId, memberId);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/clubs/{clubId:\\d+}/dashboard/attendance")
	public ResponseEntity<List<MonthlyAttendanceDto>> getMonthlyAttendance(@PathVariable("clubId") Integer clubId) {
		List<MonthlyAttendanceDto> data = clubService.getMonthlyAttendance(clubId);
		return ResponseEntity.ok(data);
	}
	
	@GetMapping("/clubs/{clubId:\\d+}/dashboard/age")
	public ResponseEntity<List<AgeDistributionDto>> getAgeDistribution(@PathVariable("clubId") Integer clubId) {
		List<AgeDistributionDto> data = clubService.getAgeDistribution(clubId);
		return ResponseEntity.ok(data);
	}
	
	@GetMapping("/clubs/{clubId:\\d+}/dashboard/gender")
	public ResponseEntity<GenderRatioDto> getGenderRatio(@PathVariable("clubId") Integer clubId) {
		GenderRatioDto data = clubService.getGenderRatio(clubId);
		return ResponseEntity.ok(data);
	}
	
	@GetMapping("/clubs/{clubId:\\d+}/dashboard/quarterly-join")
	public ResponseEntity<List<QuarterlyJoinDto>> getQuarterlyJoinStats(@PathVariable("clubId") Integer clubId) {
		List<QuarterlyJoinDto> data = clubService.getQuarterlyJoinStats(clubId);
		return ResponseEntity.ok(data);
	}
	
	@GetMapping("/clubs/recommend/category")
	public ResponseEntity<List<RecommendClubDto>> recommendByCategory(
			@AuthenticationPrincipal CustomUserDetails userDetails) {
		log.info("카테고리 기반 동호회 추천 요청 - 회원 ID: {}", userDetails.getMember().getMemberId());
		List<RecommendClubDto> recommendations = clubService.recommendByCategory(userDetails.getMember().getMemberId());
		return ResponseEntity.ok(recommendations);
	}

	@GetMapping("/clubs/recommend/region")
	public ResponseEntity<List<RecommendClubDto>> recommendByRegion(
			@AuthenticationPrincipal CustomUserDetails userDetails) {
		log.info("지역 기반 동호회 추천 요청 - 회원 ID: {}", userDetails.getMember().getMemberId());
		List<RecommendClubDto> recommendations = clubService.recommendByRegion(userDetails.getMember().getMemberId());
		return ResponseEntity.ok(recommendations);
	}

	@GetMapping("/clubs/recommend/combined")
	public ResponseEntity<List<RecommendClubDto>> recommendByCombined(
			@AuthenticationPrincipal CustomUserDetails userDetails) {
		log.info("복합 동호회 추천 요청 - 회원 ID: {}", userDetails.getMember().getMemberId());
		List<RecommendClubDto> recommendations = clubService.recommendByCombined(userDetails.getMember().getMemberId());
		return ResponseEntity.ok(recommendations);
	}
	
	@GetMapping("/clubs/recent")
	public ResponseEntity<List<RecommendClubDto>> getRecentClubs() {
		log.info("최근 생성 동호회 조회 요청 (메인용)");
		List<RecommendClubDto> clubs = clubService.getRecentClubs();
		return ResponseEntity.ok(clubs);
	}

	@GetMapping("/clubs/recent/all")
	public ResponseEntity<List<RecommendClubDto>> getRecentClubsAll(
			@RequestParam(value = "size", required = false, defaultValue = "10") Integer size,
			@RequestParam(value = "cursor", required = false) Integer cursor) {
		log.info("최근 생성 동호회 조회 요청 (더보기용) - size: {}, cursor: {}", size, cursor);
		List<RecommendClubDto> clubs = clubService.getRecentClubsAll(size, cursor);
		return ResponseEntity.ok(clubs);
	}

	@GetMapping("/clubs/category/{categoryId}")
	public ResponseEntity<List<RecommendClubDto>> getClubsByCategory(@PathVariable("categoryId") Integer categoryId) {
		log.info("카테고리별 동호회 조회 요청 (메인용) - 카테고리 ID: {}", categoryId);
		List<RecommendClubDto> clubs = clubService.getClubsByCategory(categoryId);
		return ResponseEntity.ok(clubs);
	}

	@GetMapping("/clubs/category/{categoryId}/all")
	public ResponseEntity<List<RecommendClubDto>> getClubsByCategoryAll(
			@PathVariable("categoryId") Integer categoryId,
			@RequestParam(value = "size", required = false, defaultValue = "10") Integer size,
			@RequestParam(value = "cursor", required = false) Integer cursor) {
		log.info("카테고리별 동호회 조회 요청 (더보기용) - 카테고리 ID: {}, size: {}, cursor: {}", categoryId, size, cursor);
		List<RecommendClubDto> clubs = clubService.getClubsByCategoryAll(categoryId, size, cursor);
		return ResponseEntity.ok(clubs);
	}
	
	@GetMapping("/clubs/{clubid}/members/summary")
	public ResponseEntity<List<ClubMemberDto>> getClubMembers(@PathVariable("clubid") Integer clubId){
		List<ClubMemberDto> members = clubService.getClubMembers(clubId);
		return ResponseEntity.ok(members);
	}
	
	
	/**
	 * 인기 동호회 조회 (통합)
	 * @param size 조회할 개수 (메인: 3, 더보기: 12)
	 * @param cursor 페이징 커서
	 */
	@GetMapping("/clubs/popular")
	public ResponseEntity<List<RecommendClubDto>> getPopularClubs(
	        @RequestParam(name = "size", defaultValue = "3") int size,
	        @RequestParam(name = "cursor", required = false) Integer cursor) {
	    List<RecommendClubDto> clubs = clubService.getPopularClubs(size, cursor);
	    return ResponseEntity.ok(clubs);
	}

	/**
	 * 급성장 동호회 조회 (통합)
	 * @param size 조회할 개수 (메인: 3, 더보기: 12)
	 * @param cursor 페이징 커서
	 */
	@GetMapping("/clubs/growing")
	public ResponseEntity<List<RecommendClubDto>> getGrowingClubs(
	        @RequestParam(name = "size", defaultValue = "3") int size,
	        @RequestParam(name = "cursor", required = false) Integer cursor) {
	    List<RecommendClubDto> clubs = clubService.getGrowingClubs(size, cursor);
	    return ResponseEntity.ok(clubs);
	}

	/**
	 * 활발한 동호회 조회 (통합)
	 * @param size 조회할 개수 (메인: 3, 더보기: 12)
	 * @param cursor 페이징 커서
	 */
	@GetMapping("/clubs/active")
	public ResponseEntity<List<RecommendClubDto>> getActiveClubs(
	        @RequestParam(name = "size", defaultValue = "3") int size,
	        @RequestParam(name = "cursor", required = false) Integer cursor) {
	    List<RecommendClubDto> clubs = clubService.getActiveClubs(size, cursor);
	    return ResponseEntity.ok(clubs);
	}
}

