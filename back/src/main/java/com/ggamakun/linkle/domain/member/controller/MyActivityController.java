package com.ggamakun.linkle.domain.member.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ggamakun.linkle.domain.member.dto.MyActivityPostDto;
import com.ggamakun.linkle.domain.member.service.IMyActivityService;
import com.ggamakun.linkle.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/member/activities")
public class MyActivityController {
	private final IMyActivityService myActivityService;
	
	@GetMapping("/posts")
	public ResponseEntity<List<MyActivityPostDto>> getActivities(@RequestParam(name = "type", required = false, defaultValue = "ALL") String type,
			@Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails){
		Integer memberId = userDetails.getMember().getMemberId();
		log.info("나의 활동 조회 memberId: {}, type: {}",memberId, type);

		List<MyActivityPostDto> activities = myActivityService.getMyActivities(memberId, type);
		return ResponseEntity.ok(activities);
	}
}
