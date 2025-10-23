package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.repository.IClubMemberRepository;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.global.exception.BadRequestException;
import com.ggamakun.linkle.global.exception.ForbiddenException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubMemberService implements IClubMemberService {

    private final IClubMemberRepository clubMemberRepository;
    private final IClubRepository clubRepository;

    @Override
    public List<ClubMemberDto> getClubMembers(Integer clubId, Integer currentMemberId) {
        // 동호회 회원인지 확인
        if (clubRepository.isClubMember(clubId, currentMemberId) == 0) {
            throw new ForbiddenException("동호회 회원만 조회할 수 있습니다.");
        }

        return clubMemberRepository.findMembersByClubId(clubId);
    }

    @Override
    public List<ClubMemberDto> getWaitingMembers(Integer clubId, Integer currentMemberId) {
        // 운영진 이상 권한 확인
        String role = clubRepository.getMemberRole(clubId, currentMemberId);
        if (!"LEADER".equals(role) && !"MANAGER".equals(role)) {
            throw new ForbiddenException("운영진 이상만 조회할 수 있습니다.");
        }

        return clubMemberRepository.findWaitingMembersByClubId(clubId);
    }

    @Override
    @Transactional
    public void updateMemberRole(Integer clubId, Integer targetMemberId, String role, Integer currentMemberId) {
        // 운영진 이상 권한 확인
        String currentRole = clubRepository.getMemberRole(clubId, currentMemberId);
        if (!"LEADER".equals(currentRole) && !"MANAGER".equals(currentRole)) {
            throw new ForbiddenException("운영진 이상만 권한을 변경할 수 있습니다.");
        }

        // 자기 자신의 권한 변경 불가
        if (currentMemberId.equals(targetMemberId)) {
            throw new BadRequestException("자기 자신의 권한은 변경할 수 없습니다.");
        }

        // 대상 회원의 현재 역할 확인
        String targetRole = clubRepository.getMemberRole(clubId, targetMemberId);
        
        // 동호회장 권한 변경 불가
        if ("LEADER".equals(targetRole)) {
            throw new BadRequestException("동호회장의 권한은 변경할 수 없습니다.");
        }

        int updated = clubMemberRepository.updateMemberRole(clubId, targetMemberId, role, currentMemberId);
        if (updated == 0) {
            throw new BadRequestException("회원을 찾을 수 없습니다.");
        }

        log.info("권한 변경 완료 - clubId: {}, targetMemberId: {}, newRole: {}", clubId, targetMemberId, role);
    }

    @Override
    @Transactional
    public void removeMember(Integer clubId, Integer targetMemberId, String reason, Boolean allowRejoin, Integer currentMemberId) {
        // 운영진 이상 권한 확인
        String currentRole = clubRepository.getMemberRole(clubId, currentMemberId);
        if (!"LEADER".equals(currentRole) && !"MANAGER".equals(currentRole)) {
            throw new ForbiddenException("운영진 이상만 강제 탈퇴를 할 수 있습니다.");
        }

        // 자기 자신 강제 탈퇴 불가
        if (currentMemberId.equals(targetMemberId)) {
            throw new BadRequestException("자기 자신을 강제 탈퇴할 수 없습니다.");
        }

        // 대상 회원의 현재 역할 확인
        String targetRole = clubRepository.getMemberRole(clubId, targetMemberId);
        
        // 동호회장 강제 탈퇴 불가
        if ("LEADER".equals(targetRole)) {
            throw new BadRequestException("동호회장을 강제 탈퇴할 수 없습니다.");
        }

        int removed;
        if (allowRejoin) {
            removed = clubMemberRepository.expelMember(clubId, targetMemberId, reason, currentMemberId);
        } else {
            removed = clubMemberRepository.blockMember(clubId, targetMemberId, reason, currentMemberId);
        }

        if (removed == 0) {
            throw new BadRequestException("회원을 찾을 수 없습니다.");
        }

        log.info("강제 탈퇴 완료 - clubId: {}, targetMemberId: {}, allowRejoin: {}", clubId, targetMemberId, allowRejoin);
    }

    @Override
    @Transactional
    public void approveMember(Integer clubId, Integer targetMemberId, Integer currentMemberId) {
        // 운영진 이상 권한 확인
        String role = clubRepository.getMemberRole(clubId, currentMemberId);
        if (!"LEADER".equals(role) && !"MANAGER".equals(role)) {
            throw new ForbiddenException("운영진 이상만 승인할 수 있습니다.");
        }

        int approved = clubMemberRepository.approveMember(clubId, targetMemberId, currentMemberId);
        if (approved == 0) {
            throw new BadRequestException("승인 대기 중인 회원을 찾을 수 없습니다.");
        }

        log.info("가입 승인 완료 - clubId: {}, targetMemberId: {}", clubId, targetMemberId);
    }

    @Override
    @Transactional
    public void rejectMember(Integer clubId, Integer targetMemberId, String rejectionReason, Integer currentMemberId) {
        // 운영진 이상 권한 확인
        String role = clubRepository.getMemberRole(clubId, currentMemberId);
        if (!"LEADER".equals(role) && !"MANAGER".equals(role)) {
            throw new ForbiddenException("운영진 이상만 거절할 수 있습니다.");
        }

        int rejected = clubMemberRepository.rejectMember(clubId, targetMemberId, rejectionReason, currentMemberId);
        if (rejected == 0) {
            throw new BadRequestException("승인 대기 중인 회원을 찾을 수 없습니다.");
        }

        log.info("가입 거절 완료 - clubId: {}, targetMemberId: {}", clubId, targetMemberId);
    }
}