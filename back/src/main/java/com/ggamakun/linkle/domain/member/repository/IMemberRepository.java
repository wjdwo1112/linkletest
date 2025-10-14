package com.ggamakun.linkle.domain.member.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.member.entity.Member;

@Mapper
public interface IMemberRepository {
    
    // 이메일로 회원 조회
    Member findByEmailForAuth(String email);
    
    // 회원 등록
    int insertMember(Member member);
    
    // 회원 ID로 조회
    Member findById(Integer memberId);
    
    // 이메일 중복 확인
    int countByEmail(String email);
    
    // 닉네임 중복 확인
    int countByNickname(String nickname);
    
    // 회원 정보 수정
    int updateMember(Member member);
    
    // Provider와 ProviderId로 회원 조회 (소셜 로그인용)
    Member findByProviderAndProviderId(@Param("provider") String provider, 
                                       @Param("providerId") String providerId);
    // 이메일 인증
    Member findByVerificationToken(String token);
}