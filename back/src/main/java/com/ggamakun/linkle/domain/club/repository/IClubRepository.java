package com.ggamakun.linkle.domain.club.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;

@Mapper
public interface IClubRepository {

	List<ClubSummary> findClubsByMemberId(@Param("memberId") Integer memberId);

}
