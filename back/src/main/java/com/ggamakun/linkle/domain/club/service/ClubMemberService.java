package com.ggamakun.linkle.domain.club.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.entity.Club;
import com.ggamakun.linkle.domain.club.repository.IClubMemberRepository;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.domain.notification.dto.CreateNotificationRequestDto;
import com.ggamakun.linkle.domain.notification.service.NotificationService;
import com.ggamakun.linkle.global.exception.BadRequestException;
import com.ggamakun.linkle.global.exception.ForbiddenException;
import com.ggamakun.linkle.global.exception.NotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubMemberService implements IClubMemberService {

    private final IClubMemberRepository clubMemberRepository;
    private final IClubRepository clubRepository;
    private final NotificationService notificationService;
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
        
        //권한 변경 알림
        String roleText = "MANAGER".equals(role) ? "운영진": "회원";
        Club club = clubRepository.findById(clubId);
        String clubName = (club != null) ? club.getName() : "동호회";
        
        notificationService.sendNotification(
        		CreateNotificationRequestDto.builder()
        			.receiverId(targetMemberId)
        			.title("권한이 변경되었습니다.")
        			.content(clubName + "동호회에서" + roleText + "으로 변경되었습니다.")
        			.linkUrl("/clubs/" + clubId + "/dashboard")
        			.createdBy(currentMemberId)
        			.build()
        	);
        

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
        
        //강제 탈퇴 알림
        Club club = clubRepository.findById(clubId);
        String clubName = (club != null) ? club.getName() : "동호회";
        String rejoinText = allowRejoin ? "재가입이 가능합니다." : "재가입이 제한되었습니다.";
        
        notificationService.sendNotification(
                CreateNotificationRequestDto.builder()
                    .receiverId(targetMemberId)
                    .title("동호회에서 탈퇴 처리되었습니다")
                    .content(clubName + " 동호회에서 탈퇴 처리되었습니다. 사유: " + reason + " " + rejoinText)
                    .linkUrl("/clubs/" + clubId + "/detail")
                    .createdBy(currentMemberId)
                    .build()
            );

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
        
        //가입 승인 알림
        Club club = clubRepository.findById(clubId);
        String clubName = (club != null) ? club.getName() : "동호회";
        
        notificationService.sendNotification(
        		CreateNotificationRequestDto.builder()
        			.receiverId(targetMemberId)
        			.title("가입이 승인되었습니다.")
        			.content(clubName + " " + "동호회 가입이 승인되었습니다.")
        			.linkUrl("/clubs/" + clubId + "/dashboard")
        			.createdBy(currentMemberId)
        			.build()
        			
        );

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
        
        //가입 거절 알림
        Club club = clubRepository.findById(clubId);
        String clubName = (club != null) ? club.getName() : "동호회";
        
        notificationService.sendNotification(
        		CreateNotificationRequestDto.builder()
        			.receiverId(targetMemberId)
        			.title("가입이 거절되었습니다")
        			.content(clubName + " 동호회 가입이 거절되었습니다. 사유: " + rejectionReason)
        			.linkUrl("/clubs/" + clubId + "/detail")
        			.createdBy(currentMemberId)
        			.build()
        		);

        log.info("가입 거절 완료 - clubId: {}, targetMemberId: {}", clubId, targetMemberId);
    }
    
    
    
    
    
    
    @Override
    @Transactional
    public void requestJoin(Integer clubId, Integer memberId) {
        // 1) 이미 가입/대기/차단 상태 체크
        String status = clubMemberRepository.checkMemberStatus(clubId, memberId);

        if ("APPROVED".equals(status)) {
            throw new BadRequestException("이미 가입된 회원입니다.");
        }
        if ("WAITING".equals(status)) {
            throw new BadRequestException("이미 가입 승인 대기 중입니다.");
        }
        if ("BLOCKED".equals(status)) {
            throw new ForbiddenException("재가입이 차단된 회원입니다.");
        }

        int affected = 0;

        if (status == null) {
            //신규 신청
            affected = clubMemberRepository.insertWaitingMember(clubId, memberId);
        } else {
            //기존 이력이 있는경우 REJECTED/EXPELLED/WITHDRAWN 등으로 is_deleted='Y'인 경우 재신청 처리
            affected = clubMemberRepository.reactivateToWaiting(clubId, memberId);
        }

        if (affected == 0) {
            throw new BadRequestException("가입 신청 처리에 실패했습니다.");
        }

        // 3) 운영진(LEADER/MANAGER) 조회
        List<Integer> adminIds = clubMemberRepository.findAdminIdsByClubId(clubId);
        if (adminIds == null || adminIds.isEmpty()) return;

        // 4) 운영진들에게 알림 발송
        for (Integer receiverId : adminIds) {
            notificationService.sendNotification(
                CreateNotificationRequestDto.builder()
                    .receiverId(receiverId)
                    .title("가입신청이 도착했어요")
                    .content("새로운 회원의 가입신청이 있습니다. 승인/거절을 진행해주세요.")
                    .linkUrl("/clubs/" + clubId + "/members") 
                    .createdBy(memberId)
                    .build()
            );
        }
    }
    
    @Override
    public String getMemberStatus(Integer clubId, Integer memberId) {
        return clubMemberRepository.checkMemberStatus(clubId, memberId);
    }

	@Override
	@Transactional
	public void withdrawFromClub(Integer clubId, Integer memberId) {
		//동호회 회원 목록 조회
		List<ClubMemberDto> members = clubMemberRepository.findMembersByClubId(clubId);
		
		//회원 여부와 역할 확인
		boolean isMember = false;
		boolean isLeader = false;
		Integer leaderId = null;
		String memberNickname = null;
		
		for(ClubMemberDto member : members) {
			if(member.getMemberId().equals(memberId)) {
				if("APPROVED".equals(member.getStatus())) {
					isMember = true;
				}
				if("LEADER".equals(member.getRole())) {
					isLeader = true;
				}
				memberNickname = member.getNickname();
			}
			
			//동호회장 ID 찾기
			if("LEADER".equals(member.getRole())) {
				leaderId = member.getMemberId();
			}
		}
		
		// 회원 여부 확인
	    if (!isMember) {
	        throw new NotFoundException("해당 동호회의 회원이 아닙니다.");
	    }
	    
	    // 리더 여부 확인
	    if (isLeader) {
	        throw new BadRequestException("동호회 리더는 탈퇴할 수 없습니다. 리더 권한을 먼저 위임해주세요.");
	    }
	    
	    // 동호회 탈퇴 처리 (소프트 삭제)
	    int result = clubMemberRepository.withdrawFromClub(clubId, memberId);
	    
	    if (result == 0) {
	        throw new BadRequestException("동호회 탈퇴에 실패했습니다.");
	    }
	    
	    // 동호회장에게 알림 발송
	    if (leaderId != null && !leaderId.equals(memberId)) {
	        Club club = clubRepository.findById(clubId);
	        String clubName = (club != null) ? club.getName() : "동호회";
	        String nickname = (memberNickname != null) ? memberNickname : "회원";
	        
	        notificationService.sendNotification(
	            CreateNotificationRequestDto.builder()
	                .receiverId(leaderId)
	                .title("회원이 탈퇴했습니다")
	                .content(clubName + " - " + nickname + "님이 동호회를 탈퇴했습니다.")
	                .linkUrl("/clubs/" + clubId + "/members")
	                .createdBy(memberId)
	                .build()
	        );
	        
	        log.info("동호회장에게 탈퇴 알림 발송 완료 - 동호회장 ID: {}", leaderId);
	    }
	    
	    log.info("동호회 탈퇴 완료 - 동호회 ID: {}, 회원 ID: {}", clubId, memberId);
		
	}
}