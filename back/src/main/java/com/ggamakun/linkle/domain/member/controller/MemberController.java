package com.ggamakun.linkle.domain.member.controller;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.member.dto.MemberProfileDto;
import com.ggamakun.linkle.domain.member.dto.UpdateBasicInfoRequestDto;
import com.ggamakun.linkle.domain.member.dto.UpdateInterestsRequestDto;
import com.ggamakun.linkle.domain.member.dto.UpdatePasswordRequestDto;
import com.ggamakun.linkle.domain.member.dto.WithdrawAccountRequestDto;
import com.ggamakun.linkle.domain.member.service.MemberService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "회원", description = "회원 정보 관련 API")
public class MemberController {
    
    private final MemberService memberService;
    
    @GetMapping("/profile")
    public ResponseEntity<MemberProfileDto> getProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("회원 프로필 조회 요청 - Member ID: {}", memberId);
        
        MemberProfileDto profile = memberService.getProfile(memberId);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<Void> updateBasicInfo(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid UpdateBasicInfoRequestDto request) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("기본 정보 수정 요청 - Member ID: {}", memberId);
        
        memberService.updateBasicInfo(
            memberId, 
            request.getNickname(), 
            null,
            null,
            request.getSido(), 
            request.getSigungu(),
            request.getDescription()
        );
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/interests")
    public ResponseEntity<Void> updateInterests(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid UpdateInterestsRequestDto request) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("관심사 수정 요청 - Member ID: {}", memberId);
        
        String interests = request.getInterests().stream()
                .map(String::valueOf)
                .collect(Collectors.joining("/"));
        
        memberService.updateInterests(memberId, interests);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
        log.info("닉네임 중복 체크: {}", nickname);
        boolean isDuplicate = memberService.checkNicknameDuplicate(nickname);
        return ResponseEntity.ok(isDuplicate);
    }
    
    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid UpdatePasswordRequestDto request) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("비밀번호 변경 요청 - Member ID: {}", memberId);
        
        memberService.updatePassword(
            memberId, 
            request.getCurrentPassword(), 
            request.getNewPassword()
        );
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/withdrawal")
    public ResponseEntity<Void> withdrawAccount(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) WithdrawAccountRequestDto request) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("회원 탈퇴 요청 - Member ID: {}", memberId);
        
        String password = request != null ? request.getPassword() : null;
        memberService.withdrawAccount(memberId, password);
        
        return ResponseEntity.ok().build();
    }
}