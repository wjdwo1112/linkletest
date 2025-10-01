package com.ggamakun.linkle.domain.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.auth.dto.LoginRequestDto;
import com.ggamakun.linkle.domain.auth.dto.LoginResponseDto;
import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.global.exception.UnauthorizedException;
import com.ggamakun.linkle.global.security.CustomUserDetails;
import com.ggamakun.linkle.global.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    
    public LoginResponseDto login(LoginRequestDto request) {
        try {
            // 사용자 인증
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), 
                    request.getPassword()
                )
            );
            
            // 인증된 사용자 정보 가져오기
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Member member = userDetails.getMember();
            
            // JWT 토큰 생성
            String accessToken = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
            String refreshToken = jwtUtil.createRefreshToken(member.getMemberId(), member.getEmail());
            
            // 응답 DTO 생성
            return new LoginResponseDto(
                member.getMemberId(),
                member.getEmail(),
                member.getName(),
                member.getNickname(),
                accessToken,
                refreshToken
            );
            
        } catch (AuthenticationException e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }
}