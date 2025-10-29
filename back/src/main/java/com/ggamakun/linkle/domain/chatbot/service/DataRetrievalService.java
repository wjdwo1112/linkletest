package com.ggamakun.linkle.domain.chatbot.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.repository.IClubRepository;
import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.domain.member.repository.IMemberRepository;
import com.ggamakun.linkle.domain.schedule.dto.ScheduleSummary;
import com.ggamakun.linkle.domain.schedule.repository.IScheduleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataRetrievalService {

    private final IMemberRepository memberRepository;
    private final IClubRepository clubRepository;
    private final IScheduleRepository scheduleRepository;

    public Member getMemberInfo(Integer memberId) {
        return memberRepository.findById(memberId);
    }

    public List<ClubSummary> getMemberClubs(Integer memberId) {
        return clubRepository.findClubsByMemberId(memberId);
    }

    public List<ScheduleSummary> getClubSchedules(Integer clubId) {
        return scheduleRepository.findByClubId(clubId);
    }

    public String buildContextForPrompt(Integer memberId, String userMessage) {
        StringBuilder context = new StringBuilder();
        
        Member member = getMemberInfo(memberId);
        if (member != null) {
            context.append("사용자 정보:\n");
            context.append("- 닉네임: ").append(member.getNickname()).append("\n");
            context.append("- 지역: ").append(member.getSido()).append(" ").append(member.getSigungu()).append("\n");
            if (member.getInterests() != null) {
                context.append("- 관심사: ").append(member.getInterests()).append("\n");
            }
        }
        
        List<ClubSummary> clubs = getMemberClubs(memberId);
        if (!clubs.isEmpty()) {
            context.append("\n가입한 동호회:\n");
            for (ClubSummary club : clubs) {
                context.append("- ").append(club.getName())
                       .append(" (역할: ").append(club.getRole()).append(")\n");
            }
        }
        
        return context.toString();
    }
}