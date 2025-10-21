package com.ggamakun.linkle.domain.schedule.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.schedule.dto.CreateScheduleRequest;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleDetail;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleSummary;
import com.ggamakun.linkle.domain.schedule.service.IScheduleService;
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
@RequestMapping("/schedules")
@Tag(name = "일정", description = "일정 관련 API")
public class ScheduleController {
	
	private final IScheduleService scheduleService;
	
	@PostMapping("")
    @Operation(
        summary = "일정 생성",
        description = "새로운 일정을 생성합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Integer> createSchedule(
            @Valid @RequestBody CreateScheduleRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        request.setCreatedBy(memberId);
        Integer scheduleId = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleId);
    }
	
	@DeleteMapping("/{scheduleId}")
    @Operation(
        summary = "일정 취소",
        description = "일정을 취소합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "취소 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    public ResponseEntity<Void> cancelSchedule(
            @PathVariable("scheduleId") Integer scheduleId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        scheduleService.cancelSchedule(scheduleId, memberId);
        return ResponseEntity.ok().build();
    }
	
	@GetMapping("/{scheduleId}")
    @Operation(
        summary = "일정 상세 조회",
        description = "특정 일정의 상세 정보를 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음")
    })
    public ResponseEntity<ScheduleDetail> getSchedule(@PathVariable("scheduleId") Integer scheduleId) {
        ScheduleDetail schedule = scheduleService.getSchedule(scheduleId);
        return ResponseEntity.ok(schedule);
    }
    
    @GetMapping("/club/{clubId}")
    @Operation(
        summary = "동호회 일정 목록 조회",
        description = "특정 동호회의 일정 목록을 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    public ResponseEntity<List<ScheduleSummary>> getSchedulesByClubId(@PathVariable("clubId") Integer clubId) {
        List<ScheduleSummary> schedules = scheduleService.getSchedulesByClubId(clubId);
        return ResponseEntity.ok(schedules);
    }
    
    @PutMapping("/{scheduleId}/attendance")
    @Operation(
        summary = "참석 상태 변경",
        description = "일정 참석 상태를 변경합니다. (WAITING/ATTEND/ABSENT)",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "변경 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<Void> updateAttendanceStatus(
            @PathVariable("scheduleId") Integer scheduleId,
            @RequestParam("status") String status,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        scheduleService.updateAttendanceStatus(scheduleId, memberId, status);
        return ResponseEntity.ok().build();
    }

}
