//package com.ggamakun.linkle.global.oauth2;
//
//import java.util.Map;
//
//import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
//import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
//import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.stereotype.Service;
//
//import com.ggamakun.linkle.domain.member.entity.Member;
//import com.ggamakun.linkle.domain.member.repository.IMemberRepository;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class CustomOAuth2UserService extends DefaultOAuth2UserService {
//    
//    private final IMemberRepository memberRepository;
//    
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2User oAuth2User = super.loadUser(userRequest);
//        
//        String registrationId = userRequest.getClientRegistration().getRegistrationId();
//        Map<String, Object> attributes = oAuth2User.getAttributes();
//        
//        log.info("OAuth2 로그인 시도 - Provider: {}", registrationId);
//        log.info("OAuth2 사용자 정보: {}", attributes);
//        
//        // Provider에 따라 사용자 정보 추출
//        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, attributes);
//        
//        if (oAuth2UserInfo.getEmail() == null) {
//            throw new OAuth2AuthenticationException("이메일을 가져올 수 없습니다.");
//        }
//        
//        // DB에서 사용자 조회 또는 생성
//        Member member = memberRepository.findByProviderAndProviderId(
//            oAuth2UserInfo.getProvider(), 
//            oAuth2UserInfo.getProviderId()
//        );
//        
//        boolean isNewUser = false;
//        
//        if (member == null) {
//            // 신규 사용자 - 기본 정보로 회원 생성
//            member = Member.builder()
//                .email(oAuth2UserInfo.getEmail())
//                .name(oAuth2UserInfo.getName())
//                .provider(oAuth2UserInfo.getProvider())
//                .providerId(oAuth2UserInfo.getProviderId())
//                .isWithdrawn("N")
//                .isDeleted("N")
//                .build();
//            
//            memberRepository.insertMember(member);
//            isNewUser = true;
//            
//            log.info("신규 소셜 로그인 사용자 생성 - ID: {}, Email: {}", 
//                member.getMemberId(), member.getEmail());
//        } else {
//            log.info("기존 소셜 로그인 사용자 - ID: {}, Email: {}", 
//                member.getMemberId(), member.getEmail());
//        }
//        
//        return new CustomOAuth2User(member, attributes, isNewUser);
//    }
//    
//    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
//        if (registrationId.equalsIgnoreCase("kakao")) {
//            return new KakaoUserInfo(attributes);
//        }
//        // 향후 네이버, 구글 등 추가 가능
//        throw new OAuth2AuthenticationException("지원하지 않는 로그인 방식입니다: " + registrationId);
//    }
//}

package com.ggamakun.linkle.global.oauth2;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.domain.member.repository.IMemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private final IMemberRepository memberRepository;
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("========== OAuth2 로그인 시작 ==========");
        
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            
            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            Map<String, Object> attributes = oAuth2User.getAttributes();
            
            log.info("OAuth2 Provider: {}", registrationId);
            log.info("OAuth2 Attributes: {}", attributes);
            
            // Provider에 따라 사용자 정보 추출
            OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, attributes);
            
            log.info("추출된 사용자 정보 - Email: {}, Name: {}, ProviderId: {}", 
                oAuth2UserInfo.getEmail(), oAuth2UserInfo.getName(), oAuth2UserInfo.getProviderId());
            
            if (oAuth2UserInfo.getEmail() == null) {
                log.error("이메일을 가져올 수 없습니다.");
                throw new OAuth2AuthenticationException("이메일을 가져올 수 없습니다.");
            }
            
            // DB에서 사용자 조회 또는 생성
            Member member = memberRepository.findByProviderAndProviderId(
                oAuth2UserInfo.getProvider(), 
                oAuth2UserInfo.getProviderId()
            );
            
            boolean isNewUser = false;
            
            if (member == null) {
                log.info("신규 사용자 - 회원 생성 시작");
                
                // 신규 사용자 - 기본 정보로 회원 생성
                member = Member.builder()
                    .email(oAuth2UserInfo.getEmail())
                    .name(oAuth2UserInfo.getName())
                    .provider(oAuth2UserInfo.getProvider())
                    .providerId(oAuth2UserInfo.getProviderId())
                    .build();
                
                int result = memberRepository.insertMember(member);
                log.info("회원 생성 결과: {}, 생성된 회원 ID: {}", result, member.getMemberId());
                
                isNewUser = true;
                
                log.info("신규 소셜 로그인 사용자 생성 완료 - ID: {}, Email: {}", 
                    member.getMemberId(), member.getEmail());
            } else {
                log.info("기존 소셜 로그인 사용자 - ID: {}, Email: {}", 
                    member.getMemberId(), member.getEmail());
            }
            
            log.info("========== OAuth2 로그인 loadUser 완료 ==========");
            return new CustomOAuth2User(member, attributes, isNewUser);
            
        } catch (Exception e) {
            log.error("========== OAuth2 로그인 실패 ==========", e);
            throw e;
        }
    }
    
    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        log.info("getOAuth2UserInfo 호출 - registrationId: {}", registrationId);
        
        if (registrationId.equalsIgnoreCase("kakao")) {
            return new KakaoUserInfo(attributes);
        }
        // 향후 네이버, 구글 등 추가 가능
        
        log.error("지원하지 않는 로그인 방식: {}", registrationId);
        throw new OAuth2AuthenticationException("지원하지 않는 로그인 방식입니다: " + registrationId);
    }
}