package com.ggamakun.linkle.domain.club.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;

@Mapper
public interface IClubRepository {

	//회원이 가입한 동호회 목록 조회
	List<ClubSummary> findClubsByMemberId(@Param("memberId") Integer memberId);

	//특정 동호회의 회원인지 확인
	int isClubMember(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
	
	//특정 동호회에서 회원의 역할 조회
	String getMemberRole(@Param("clubId") Integer clubId, @Param("memberId") Integer memberId);
}
