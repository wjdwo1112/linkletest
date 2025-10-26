package com.ggamakun.linkle.domain.club.service;

import java.util.List;



import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;

public interface IClubMemberService {

    // 동호회 회원 목록 조회
    List<ClubMemberDto> getClubMembers(Integer clubId, Integer currentMemberId);

    // 가입 신청 대기 목록 조회
    List<ClubMemberDto> getWaitingMembers(Integer clubId, Integer currentMemberId);

    // 회원 권한 변경
    void updateMemberRole(Integer clubId, Integer targetMemberId, String role, Integer currentMemberId);

    // 회원 강제 탈퇴
    void removeMember(Integer clubId, Integer targetMemberId, String reason, Boolean allowRejoin, Integer currentMemberId);

    // 가입 신청 승인
    void approveMember(Integer clubId, Integer targetMemberId, Integer currentMemberId);

    // 가입 신청 거절
    void rejectMember(Integer clubId, Integer targetMemberId, String rejectionReason, Integer currentMemberId);

	void requestJoin(Integer clubId, Integer memberId);

	String getMemberStatus(Integer clubId, Integer memberId);
    
    

	
}