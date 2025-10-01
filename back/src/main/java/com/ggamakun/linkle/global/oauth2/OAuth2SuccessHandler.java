package com.ggamakun.linkle.global.oauth2;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.global.util.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final JwtUtil jwtUtil;
    
    @Value("${oauth2.redirect.success-url}")
    private String successUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        log.info("OAuth2SuccessHandler.onAuthenticationSuccess 호출");
        
        try {
            CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
            Member member = oAuth2User.getMember();
            boolean isNewUser = oAuth2User.isNewUser();
            
            log.info("OAuth2 로그인 성공 - 회원 ID: {}, 이메일: {}, 신규 회원: {}", 
                member.getMemberId(), member.getEmail(), isNewUser);
            
            // JWT 토큰 생성
            String accessToken = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
            String refreshToken = jwtUtil.createRefreshToken(member.getMemberId(), member.getEmail());
            
            log.info("JWT 토큰 생성 완료");
            
            // URL 파라미터를 안전하게 인코딩
            String encodedEmail = URLEncoder.encode(member.getEmail() != null ? member.getEmail() : "", StandardCharsets.UTF_8.toString());
            String encodedName = URLEncoder.encode(member.getName() != null ? member.getName() : "", StandardCharsets.UTF_8.toString());
            
            // 프론트엔드로 리다이렉트 (React 라우터 경로로 수정)
            String targetUrl = UriComponentsBuilder.fromUriString(successUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("isNewUser", isNewUser)
                .queryParam("memberId", member.getMemberId())
                .queryParam("email", encodedEmail)
                .queryParam("name", encodedName)
                .build()
                .toUriString();
            
            log.info("리다이렉트 URL: {}", targetUrl);
            
            // 캐시 방지 헤더 추가
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
            
            // 리다이렉트 수행
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            
        } catch (Exception e) {
            log.error("OAuth2 로그인 성공 처리 중 오류 발생", e);
            throw new IOException("OAuth2 로그인 처리 실패", e);
        }
    }
}