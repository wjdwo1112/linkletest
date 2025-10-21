package com.ggamakun.linkle.domain.schedule.service;

import java.util.List;

import com.ggamakun.linkle.domain.schedule.dto.CreateScheduleRequest;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleDetail;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleSummary;

public interface IScheduleService {
    
    // 일정 생성
    Integer createSchedule(CreateScheduleRequest request);
    
    // 일정 취소
    void cancelSchedule(Integer scheduleId, Integer memberId);
    
    // 일정 상세 조회
    ScheduleDetail getSchedule(Integer scheduleId);
    
    // 동호회별 일정 목록 조회
    List<ScheduleSummary> getSchedulesByClubId(Integer clubId);
    
    // 참석 상태 변경
    void updateAttendanceStatus(Integer scheduleId, Integer memberId, String status);
}