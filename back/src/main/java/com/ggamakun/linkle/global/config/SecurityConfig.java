package com.ggamakun.linkle.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ggamakun.linkle.global.security.CustomUserDetailsService;
import com.ggamakun.linkle.global.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    	log.info("[SecurityConfig] filterChain 등록 시작");
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(formLogin -> formLogin.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            
            .cors(cors -> {})
            
            
            .authorizeHttpRequests(auth -> auth
            	.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/index.html", "/css/**", "/images/**", "/js/**", "/assets/**", "/favicon.ico", "/h2-console/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/chatbot/**").permitAll()
                .requestMatchers("/member/activities/**").authenticated()
                .requestMatchers("/member/**").permitAll()
                .requestMatchers("/categories/**").permitAll()
                .requestMatchers("/file/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()
                .requestMatchers("GET","/posts/").permitAll()
                .requestMatchers("GET","/posts/summary").permitAll()
                .requestMatchers("GET","/posts/**").permitAll()
                .requestMatchers("GET","/posts/*/comments/**").permitAll()
                .requestMatchers("/comments/**").permitAll()
                .requestMatchers("/gallery/**").permitAll()
                .requestMatchers("/notifications/**").permitAll()
                .requestMatchers("GET", "/clubs/joined").authenticated()
                .requestMatchers("GET", "/clubs/search").permitAll()
                .requestMatchers("GET", "/clubs/recent").permitAll()
                .requestMatchers("GET", "/clubs/recent/all").permitAll()
                .requestMatchers("GET", "/clubs/category/**").permitAll()
                .requestMatchers("GET", "/clubs/recommend/**").authenticated()
                .requestMatchers("GET","/clubs/**").permitAll()
                .requestMatchers("GET", "/schedules/**").permitAll()
                .anyRequest().authenticated()
                
            )
            .userDetailsService(customUserDetailsService)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}