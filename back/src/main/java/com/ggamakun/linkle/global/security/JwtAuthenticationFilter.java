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
        "/auth/login",
        "/auth/refresh",
        "/oauth2",
        "/login/oauth2",
        "/swagger-ui",
        "/v3/api-docs",
        "/h2-console",
        "/file"
    );
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        // OAuth2 관련 경로는 JWT 필터를 거치지 않도록 설정
        if(EXCLUDED_PATHS.stream().anyMatch(path::startsWith)) {
        	return true;
        }
        
//     // GET 요청은 게시글/댓글 조회만 허용 (JWT 필터 제외)
//        if ("GET".equals(method)) {
//            if (path.matches("/posts(/\\d+)?") || 
//                path.equals("/posts/summary") ||
//                path.matches("/posts/\\d+/comments") ||
//                path.matches("/comments/\\d+")) {
//                return true;
//            }
//        }
        
        return false;
        
    }
    
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        String token = getTokenFromRequest(request);
        
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            String email = jwtUtil.getEmailFromToken(token);
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, 
                    null, 
                    userDetails.getAuthorities()
                );
            
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
    	// 1. Cookie에서 토큰 추출 시도
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // 2. Authorization 헤더에서 토큰 추출 (하위 호환성)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}