package com.ggamakun.linkle.domain.schedule.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.schedule.dto.AttendeeInfo;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleDetail;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleSummary;
import com.ggamakun.linkle.domain.schedule.entity.Schedule;
import com.ggamakun.linkle.domain.schedule.entity.ScheduleAttendance;

@Mapper
public interface IScheduleRepository {
    
    // 일정 생성
    int insertSchedule(Schedule schedule);
    
    // 일정 취소
    int cancelSchedule(@Param("scheduleId") Integer scheduleId, @Param("canceledBy") Integer canceledBy);
    
    // 일정 상세 조회
    ScheduleDetail findById(Integer scheduleId);
    
    // 동호회별 일정 목록 조회
    List<ScheduleSummary> findByClubId(Integer clubId);
    
    // 일정 참석자 목록 조회
    List<AttendeeInfo> findAttendeesByScheduleId(Integer scheduleId);
    
    // 참석 상태 등록
    int insertAttendance(ScheduleAttendance attendance);
    
    // 참석 상태 수정
    int updateAttendance(ScheduleAttendance attendance);
    
    // 참석 여부 확인
    int existsAttendance(@Param("scheduleId") Integer scheduleId, @Param("memberId") Integer memberId);
    
    // 참석자 수 조회
    int countAttendees(@Param("scheduleId") Integer scheduleId);
    
}