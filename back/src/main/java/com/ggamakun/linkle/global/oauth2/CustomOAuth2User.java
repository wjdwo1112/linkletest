package com.ggamakun.linkle.global.oauth2;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.ggamakun.linkle.domain.member.entity.Member;

import lombok.Getter;

@Getter
public class CustomOAuth2User implements OAuth2User {
    
    private final Member member;
    private final Map<String, Object> attributes;
    private final boolean isNewUser;
    
    public CustomOAuth2User(Member member, Map<String, Object> attributes, boolean isNewUser) {
        this.member = member;
        this.attributes = attributes;
        this.isNewUser = isNewUser;
    }
    
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    @Override
    public String getName() {
        return member.getEmail();
    }
}