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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
    @Operation(
        summary = "회원 프로필 조회", 
        description = "현재 로그인한 회원의 프로필 정보를 조회합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<MemberProfileDto> getProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer memberId = userDetails.getMember().getMemberId();
        log.info("회원 프로필 조회 요청 - Member ID: {}", memberId);
        
        MemberProfileDto profile = memberService.getProfile(memberId);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    @Operation(
        summary = "기본 정보 수정", 
        description = "회원의 기본 정보(닉네임, 주소, 소개)를 수정합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
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
    @Operation(
        summary = "관심사 수정", 
        description = "회원의 관심사를 수정합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
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
    @Operation(summary = "닉네임 중복 체크", description = "닉네임 중복 여부를 확인합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "중복 체크 완료"
        )
    })
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
        log.info("닉네임 중복 체크: {}", nickname);
        boolean isDuplicate = memberService.checkNicknameDuplicate(nickname);
        return ResponseEntity.ok(isDuplicate);
    }
    
    @PutMapping("/password")
    @Operation(
        summary = "비밀번호 변경", 
        description = "현재 비밀번호 확인 후 새 비밀번호로 변경합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "비밀번호 변경 성공"),
        @ApiResponse(responseCode = "400", description = "현재 비밀번호 불일치 또는 소셜 로그인 계정"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
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
    @Operation(
        summary = "회원 탈퇴", 
        description = "회원 탈퇴를 진행합니다. 일반 회원은 비밀번호 확인이 필요합니다.",
        security = @SecurityRequirement(name = "JWT")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "탈퇴 성공"),
        @ApiResponse(responseCode = "400", description = "비밀번호 불일치"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
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