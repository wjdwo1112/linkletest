package com.ggamakun.linkle.domain.club.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.service.IClubService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "동호회", description = "동호회 관련 API")
public class ClubController {
	
	private final IClubService clubService;

	@GetMapping("/clubs/joined")
	@Operation(
			summary = "내가 가입한 동호회 목록 조회",
			description = "현재 로그인한 회원이 가입하고 승인된 동호회 목록을 조회합니다.",
			security = @SecurityRequirement(name = "JWT")
			)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	public ResponseEntity<List<ClubSummary>> getJoinedClubs(@AuthenticationPrincipal CustomUserDetails userDetails){

		Integer memberId = userDetails.getMember().getMemberId();

		List<ClubSummary> clubs = clubService.getJoinedClubs(memberId);
		return ResponseEntity.ok(clubs);
	}

	@PostMapping("/clubs")
	@Operation(
			summary = "동호회 생성",
			description = "새로운 동호회를 생성합니다. (로그인 필수)",
			security = @SecurityRequirement(name = "JWT")
			)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "동호회 생성 성공"),
			@ApiResponse(responseCode = "400", description = "잘못된 요청"),
			@ApiResponse(responseCode = "401", description = "인증 실패")
	})
	public ResponseEntity<Club> createClub(
			@Valid @RequestBody CreateClubRequestDto request,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		Club club = clubService.createClub(request, memberId);
		return ResponseEntity.status(HttpStatus.CREATED).body(club);
	}
	
	@GetMapping("/clubs/{clubId}/member-count")
	@Operation(
			summary = "동호회 승인된 회원 수 조회",
			description = "특정 동호회의 승인된 회원 수를 조회합니다."
			)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공")
	})
	public ResponseEntity<Integer> getApprovedMemberCount(@PathVariable("clubId") Integer clubId) {
		int count = clubService.getApprovedMemberCount(clubId);
		return ResponseEntity.ok(count);
	}
	
	@GetMapping("/clubs/{clubId}")
	@Operation(
			summary = "동호회 상세 정보 조회",
			description = "특정 동호회의 상세 정보를 조회합니다.",
			security = @SecurityRequirement(name = "JWT")
			)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "404", description = "동호회를 찾을 수 없음")
	})
	public ResponseEntity<ClubDetailDto> getClubDetail(@PathVariable("clubId") Integer clubId) {
		ClubDetailDto club = clubService.getClubDetail(clubId);
		return ResponseEntity.ok(club);
	}
}

