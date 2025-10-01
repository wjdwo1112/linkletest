package com.ggamakun.linkle.global.oauth2;

/**
 * OAuth2 제공자로부터 받은 사용자 정보를 추상화하는 인터페이스
 * 각 소셜 로그인 제공자(카카오, 네이버, 구글 등)마다 다른 응답 구조를 가지므로
 * 공통 인터페이스로 통일하여 사용
 */
public interface OAuth2UserInfo {
    
    /**
     * 소셜 로그인 제공자가 부여한 사용자 고유 ID
     * @return Provider의 사용자 ID
     */
    String getProviderId();
    
    /**
     * 소셜 로그인 제공자 이름
     * @return KAKAO, NAVER, GOOGLE 등
     */
    String getProvider();
    
    /**
     * 사용자 이메일
     * @return 이메일 주소
     */
    String getEmail();
    
    /**
     * 사용자 이름 (닉네임)
     * @return 사용자 이름
     */
    String getName();
}