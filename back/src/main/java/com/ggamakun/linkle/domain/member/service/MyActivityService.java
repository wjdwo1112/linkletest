package com.ggamakun.linkle.domain.member.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.ggamakun.linkle.domain.member.dto.MyActivityPostDto;
import com.ggamakun.linkle.domain.member.repository.IMyActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyActivityService implements IMyActivityService{
	
	private final IMyActivityRepository myActivityRepository;
	
	@Override
	public List<MyActivityPostDto> getMyActivities(Integer memberId, String type) {
	
		log.info("활동 내역 조회 memberId: {}, type: {}", memberId, type);
		
		switch(type) {
		case "all":
			return myActivityRepository.findMyPosts(memberId);
		case "comments":
			return myActivityRepository.findPostsWithMyComments(memberId);
		case "likes":
			return myActivityRepository.findMyLikedPosts(memberId);
		default:
			return myActivityRepository.findMyPosts(memberId);
		}
		
	}

}
