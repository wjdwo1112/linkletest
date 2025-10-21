package com.ggamakun.linkle.domain.schedule.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.schedule.dto.AttendeeInfo;
import com.ggamakun.linkle.domain.schedule.dto.CreateScheduleRequest;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleDetail;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleSummary;
import com.ggamakun.linkle.domain.schedule.entity.Schedule;
import com.ggamakun.linkle.domain.schedule.entity.ScheduleAttendance;
import com.ggamakun.linkle.domain.schedule.repository.IScheduleRepository;
import com.ggamakun.linkle.global.exception.BadRequestException;
import com.ggamakun.linkle.global.exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService implements IScheduleService {
	
	private final IScheduleRepository scheduleRepository;

	@Override
    @Transactional
    public Integer createSchedule(CreateScheduleRequest request) {
        log.info("일정 생성 시작 - Club ID: {}, Title: {}", request.getClubId(), request.getTitle());
        
        Schedule schedule = Schedule.builder()
                .clubId(request.getClubId())
                .title(request.getTitle())
                .content(request.getContent())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .scheduleStartDate(request.getScheduleStartDate())
                .scheduleEndDate(request.getScheduleEndDate())
                .maxAttendees(request.getMaxAttendees())
                .createdBy(request.getCreatedBy())
                .build();
        
        int result = scheduleRepository.insertSchedule(schedule);
        
        if (result <= 0) {
            throw new BadRequestException("일정 생성에 실패했습니다.");
        }
        
        log.info("일정 생성 완료 - Schedule ID: {}", schedule.getScheduleId());
        return schedule.getScheduleId();
    }
	
	@Override
    @Transactional
    public void cancelSchedule(Integer scheduleId, Integer memberId) {
        log.info("일정 취소 시작 - Schedule ID: {}, Member ID: {}", scheduleId, memberId);
        
        ScheduleDetail existing = scheduleRepository.findById(scheduleId);
        
        if (existing == null) {
            throw new BadRequestException("존재하지 않는 일정입니다.");
        }
        
        if (!existing.getCreatedBy().equals(memberId)) {
            throw new UnauthorizedException("일정을 취소할 권한이 없습니다.");
        }
        
        int result = scheduleRepository.cancelSchedule(scheduleId, memberId);
        
        if (result <= 0) {
            throw new BadRequestException("일정 취소에 실패했습니다.");
        }
        
        log.info("일정 취소 완료 - Schedule ID: {}", scheduleId);
    }
    
    @Override
    public ScheduleDetail getSchedule(Integer scheduleId) {
        log.info("일정 상세 조회 - Schedule ID: {}", scheduleId);
        
        ScheduleDetail schedule = scheduleRepository.findById(scheduleId);
        
        if (schedule == null) {
            throw new BadRequestException("존재하지 않는 일정입니다.");
        }
        
        List<AttendeeInfo> attendees = scheduleRepository.findAttendeesByScheduleId(scheduleId);
        schedule.setAttendees(attendees);
        
        return schedule;
    }
    
    @Override
    public List<ScheduleSummary> getSchedulesByClubId(Integer clubId) {
        log.info("동호회 일정 목록 조회 - Club ID: {}", clubId);
        return scheduleRepository.findByClubId(clubId);
    }
    
    @Override
    @Transactional
    public void updateAttendanceStatus(Integer scheduleId, Integer memberId, String status) {
        log.info("참석 상태 변경 - Schedule ID: {}, Member ID: {}, Status: {}", scheduleId, memberId, status);
        
        if (!status.matches("^(WAITING|ATTEND|ABSENT)$")) {
            throw new BadRequestException("유효하지 않은 참석 상태입니다.");
        }
        
        ScheduleDetail schedule = scheduleRepository.findById(scheduleId);
        
        if (schedule == null) {
            throw new BadRequestException("존재하지 않는 일정입니다.");
        }
        
        if ("Y".equals(schedule.getIsCanceled())) {
            throw new BadRequestException("취소된 일정입니다.");
        }
        
        if ("ATTEND".equals(status) && schedule.getMaxAttendees() != null) {
            int currentAttendees = scheduleRepository.countAttendees(scheduleId);
            if (currentAttendees >= schedule.getMaxAttendees()) {
                throw new BadRequestException("최대 참석 인원을 초과했습니다.");
            }
        }
        
        int exists = scheduleRepository.existsAttendance(scheduleId, memberId);
        
        ScheduleAttendance attendance = ScheduleAttendance.builder()
                .scheduleId(scheduleId)
                .memberId(memberId)
                .attendanceStatus(status)
                .createdBy(memberId)
                .updatedBy(memberId)
                .build();
        
        int result;
        if (exists > 0) {
            result = scheduleRepository.updateAttendance(attendance);
        } else {
            result = scheduleRepository.insertAttendance(attendance);
        }
        
        if (result <= 0) {
            throw new BadRequestException("참석 상태 변경에 실패했습니다.");
        }
        
        log.info("참석 상태 변경 완료 - Schedule ID: {}, Member ID: {}", scheduleId, memberId);
    }

}
