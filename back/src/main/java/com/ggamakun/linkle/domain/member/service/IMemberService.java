package com.ggamakun.linkle.domain.member.service;

import java.sql.Timestamp;

import com.ggamakun.linkle.domain.member.dto.MemberProfileDto;
import com.ggamakun.linkle.domain.member.entity.Member;

public interface IMemberService {
    
    /**
     * 회원 프로필 조회
     */
    MemberProfileDto getProfile(Integer memberId);
    
    /**
     * 기본 정보 업데이트 (닉네임, 생년월일, 성별, 주소, 소개)
     */
    void updateBasicInfo(Integer memberId, String nickname, Timestamp birthDate, 
            String gender, String sido, String sigungu, String description);
    
    /**
     * 기본 정보 업데이트 (닉네임, 생년월일, 성별, 주소)
     */
    void updateBasicInfo(Integer memberId, String nickname, Timestamp birthDate, 
            String gender, String sido, String sigungu);
    
    /**
     * 관심사 업데이트
     */
    void updateInterests(Integer memberId, String interests);
    
    /**
     * 닉네임 중복 체크
     */
    boolean checkNicknameDuplicate(String nickname);
    
    /**
     * 회원 조회
     */
    Member getMemberById(Integer memberId);
    
    /**
     * 비밀번호 변경
     */
    void updatePassword(Integer memberId, String currentPassword, String newPassword);
    
    /**
     * 회원 탈퇴
     */
    void withdrawAccount(Integer memberId, String password);
}