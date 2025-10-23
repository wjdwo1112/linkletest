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
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.CreateClubRequestDto;
import com.ggamakun.linkle.domain.club.dto.UpdateClubRequestDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.service.IClubService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "동호회", description = "동호회 관련 API")
public class ClubController {
	
	private final IClubService clubService;

	@GetMapping("/clubs/joined")
	public ResponseEntity<List<ClubSummary>> getJoinedClubs(@AuthenticationPrincipal CustomUserDetails userDetails){

		Integer memberId = userDetails.getMember().getMemberId();

		List<ClubSummary> clubs = clubService.getJoinedClubs(memberId);
		return ResponseEntity.ok(clubs);
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
	
	@GetMapping("/clubs/{clubId}/member-count")
	public ResponseEntity<Integer> getApprovedMemberCount(@PathVariable("clubId") Integer clubId) {
		int count = clubService.getApprovedMemberCount(clubId);
		return ResponseEntity.ok(count);
	}
	
	@GetMapping("/clubs/{clubId}")
	public ResponseEntity<ClubDetailDto> getClubDetail(@PathVariable("clubId") Integer clubId) {
		ClubDetailDto club = clubService.getClubDetail(clubId);
		return ResponseEntity.ok(club);
	}
	
	@PutMapping("/clubs/{clubId}")
	public ResponseEntity<Void> updateClub(
			@PathVariable("clubId") Integer clubId,
			@Valid @RequestBody UpdateClubRequestDto request,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		clubService.updateClub(clubId, request, memberId);
		return ResponseEntity.ok().build();
	}
	
	@DeleteMapping("/clubs/{clubId}")
	public ResponseEntity<Void> deleteClub(
			@PathVariable("clubId") Integer clubId,
			@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
			) {
		Integer memberId = userDetails.getMember().getMemberId();
		clubService.deleteClub(clubId, memberId);
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/clubs/{clubid}/members")
	public ResponseEntity<List<ClubMemberDto>> getClubMembers(@PathVariable("clubid") Integer clubId){
		List<ClubMemberDto> members = clubService.getClubMembers(clubId);
		return ResponseEntity.ok(members);
	}
}

