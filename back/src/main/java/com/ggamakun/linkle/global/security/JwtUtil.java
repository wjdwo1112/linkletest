package com.ggamakun.linkle.global.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtil {
    
    private final SecretKey secretKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;
    
    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.access-token-expiry}") long accessTokenExpiry,
                   @Value("${jwt.refresh-token-expiry}") long refreshTokenExpiry) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }
    
    // Access Token 생성
    public String createAccessToken(Integer memberId, String email) {
        return createToken(memberId, email, accessTokenExpiry);
    }
    
    // Refresh Token 생성
    public String createRefreshToken(Integer memberId, String email) {
        return createToken(memberId, email, refreshTokenExpiry);
    }
    
    // 토큰 생성
    private String createToken(Integer memberId, String email, long expiry) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiry);
        
        return Jwts.builder()
                .setSubject(memberId.toString())
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }
    
    // 토큰에서 회원 ID 추출
    public Long getMemberIdFromToken(String token) {
        return Long.parseLong(getClaimsFromToken(token).getSubject());
    }
    
    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).get("email", String.class);
    }
    
    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
    
    // Claims 추출
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}