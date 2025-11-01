package com.ggamakun.linkle.global.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    
    // JWT 필터를 적용하지 않을 경로들
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
        "/auth/refresh",
        "/swagger-ui",
        "/v3/api-docs",
        "/h2-console",
        "/assets",
        "/css",
        "/js",
        "/images",
        "/favicon.ico"
    );
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }
    
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
    	log.info("[JwtAuthenticationFilter] doFilterInternal called: {}", request.getRequestURI());
    	log.info("[JWT Filter] 요청 경로: {}", request.getRequestURI());
    	
        String token = getTokenFromRequest(request);
        log.info("[JWT Filter] 추출된 토큰: {}", token != null ? "존재함" : "없음");
        
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
        	boolean isValid = jwtUtil.validateToken(token);
            log.info("[JWT Filter] 토큰 유효성: {}", isValid);
            String email = jwtUtil.getEmailFromToken(token);
            log.info("[JWT Filter] 토큰에서 추출된 이메일: {}", email);
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            log.info("[JWT Filter] UserDetails 로드 성공: {}", userDetails != null);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, 
                    null, 
                    userDetails.getAuthorities()
                );
            
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("[JWT Filter] 인증 정보 SecurityContext에 저장 완료");
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
    	// 1. Cookie에서 토큰 추출 시도
        if (request.getCookies() != null) {
        	log.info("[JWT Filter] 쿠키 개수: {}", request.getCookies().length);
            for (Cookie cookie : request.getCookies()) {
            	log.info("[JWT Filter] 쿠키 이름: {}, 값: {}", cookie.getName(), cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...");
                if ("accessToken".equals(cookie.getName())) {
                	log.info("[JWT Filter] accessToken 쿠키 발견");
                    return cookie.getValue();
                }
            }
        } else {
            log.warn("[JWT Filter] 쿠키가 없습니다");
        }
        
        // 2. Authorization 헤더에서 토큰 추출 (하위 호환성)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
        	log.info("[JWT Filter] Authorization 헤더에서 토큰 추출");
            return bearerToken.substring(7);
        }
        
        return null;
    }
}