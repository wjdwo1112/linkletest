package com.ggamakun.linkle.domain.club.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.service.IClubService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
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
}
