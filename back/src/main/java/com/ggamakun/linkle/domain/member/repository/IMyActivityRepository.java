package com.ggamakun.linkle.domain.member.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.ggamakun.linkle.domain.member.dto.MyActivityPostDto;

@Mapper
public interface IMyActivityRepository {

	//내가 작성한 글
	List<MyActivityPostDto> findMyPosts(Integer memberId);

	//내가 댓글단 글
	List<MyActivityPostDto> findPostsWithMyComments(Integer memberId);
	
	//내가 좋아요 누른 글
	List<MyActivityPostDto> findMyLikedPosts(Integer memberId);
}
