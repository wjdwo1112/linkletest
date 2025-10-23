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

import io.swagger.v3.oas.annotations.Parameter;
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
    public ResponseEntity<Integer> createSchedule(
            @Valid @RequestBody CreateScheduleRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        request.setCreatedBy(memberId);
        Integer scheduleId = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleId);
    }
	
	@DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> cancelSchedule(
            @PathVariable("scheduleId") Integer scheduleId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        scheduleService.cancelSchedule(scheduleId, memberId);
        return ResponseEntity.ok().build();
    }
	
	@GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleDetail> getSchedule(@PathVariable("scheduleId") Integer scheduleId) {
        ScheduleDetail schedule = scheduleService.getSchedule(scheduleId);
        return ResponseEntity.ok(schedule);
    }
    
    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<ScheduleSummary>> getSchedulesByClubId(@PathVariable("clubId") Integer clubId) {
        List<ScheduleSummary> schedules = scheduleService.getSchedulesByClubId(clubId);
        return ResponseEntity.ok(schedules);
    }
    
    @PutMapping("/{scheduleId}/attendance")
    public ResponseEntity<Void> updateAttendanceStatus(
            @PathVariable("scheduleId") Integer scheduleId,
            @RequestParam("status") String status,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        scheduleService.updateAttendanceStatus(scheduleId, memberId, status);
        return ResponseEntity.ok().build();
    }

}
