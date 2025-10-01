package com.ggamakun.linkle.global.oauth2;

import java.util.Map;

/**
 * 카카오 OAuth2 사용자 정보 구현체
 * 카카오 API 응답 구조에 맞춰 사용자 정보를 추출
 */
public class KakaoUserInfo implements OAuth2UserInfo {
    
    private final Map<String, Object> attributes;
    
    public KakaoUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getProviderId() {
        // 카카오는 id 필드에 사용자 고유 번호 제공
        Object id = attributes.get("id");
        return id != null ? id.toString() : null;
    }
    
    @Override
    public String getProvider() {
        return "KAKAO";
    }
    
    @Override
    public String getEmail() {
        // 카카오 응답 구조: kakao_account.email
        Object kakaoAccountObj = attributes.get("kakao_account");
        if (!(kakaoAccountObj instanceof Map)) {
            return null;
        }
        
        Map<?, ?> kakaoAccount = (Map<?, ?>) kakaoAccountObj;
        Object email = kakaoAccount.get("email");
        return email instanceof String ? (String) email : null;
    }
    
    @Override
    public String getName() {
        // 카카오 응답 구조: kakao_account.profile.nickname
        Object kakaoAccountObj = attributes.get("kakao_account");
        if (!(kakaoAccountObj instanceof Map)) {
            return null;
        }
        
        Map<?, ?> kakaoAccount = (Map<?, ?>) kakaoAccountObj;
        Object profileObj = kakaoAccount.get("profile");
        if (!(profileObj instanceof Map)) {
            return null;
        }
        
        Map<?, ?> profile = (Map<?, ?>) profileObj;
        Object nickname = profile.get("nickname");
        return nickname instanceof String ? (String) nickname : null;
    }
}