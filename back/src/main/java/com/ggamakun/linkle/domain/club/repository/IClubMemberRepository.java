package com.ggamakun.linkle.domain.club.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;

@Mapper
public interface IClubMemberRepository {

    // 동호회 회원 목록 조회 (권한별 정렬)
    List<ClubMemberDto> findMembersByClubId(@Param("clubId") Integer clubId);

    // 가입 신청 대기 목록 조회
    List<ClubMemberDto> findWaitingMembersByClubId(@Param("clubId") Integer clubId);

    // 회원 권한 변경
    int updateMemberRole(@Param("clubId") Integer clubId, 
                        @Param("memberId") Integer memberId, 
                        @Param("role") String role,
                        @Param("updatedBy") Integer updatedBy);

    // 회원 강제 탈퇴 (재가입 가능)
    int expelMember(@Param("clubId") Integer clubId, 
                   @Param("memberId") Integer memberId,
                   @Param("reason") String reason,
                   @Param("updatedBy") Integer updatedBy);

    // 회원 강제 탈퇴 (재가입 차단)
    int blockMember(@Param("clubId") Integer clubId, 
                   @Param("memberId") Integer memberId,
                   @Param("reason") String reason,
                   @Param("updatedBy") Integer updatedBy);

    // 가입 신청 승인
    int approveMember(@Param("clubId") Integer clubId, 
                     @Param("memberId") Integer memberId,
                     @Param("updatedBy") Integer updatedBy);

    // 가입 신청 거절
    int rejectMember(@Param("clubId") Integer clubId, 
                    @Param("memberId") Integer memberId,
                    @Param("rejectionReason") String rejectionReason,
                    @Param("updatedBy") Integer updatedBy);

    // 재가입 차단 여부 확인
    String checkMemberStatus(@Param("clubId") Integer clubId, 
                           @Param("memberId") Integer memberId);

	List<Integer> findAdminIdsByClubId(Integer clubId);

	int reactivateToWaiting(@Param("clubId")Integer clubId, @Param("memberId")Integer memberId);

	int insertWaitingMember(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
    
	//동호회 탈퇴
	int withdrawFromClub(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
    
	Integer countApprovedByClubId(Integer clubId);
	Integer countWaitingByClubId(Integer clubId);
	Integer getMaxMembersByClubId(Integer clubId);
    
    
    
    
    
}