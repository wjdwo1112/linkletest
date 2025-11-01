package com.ggamakun.linkle.domain.auth.controller;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.auth.dto.FindIdRequestDto;
import com.ggamakun.linkle.domain.auth.dto.FindIdResponseDto;
import com.ggamakun.linkle.domain.auth.dto.ForgotPasswordRequestDto;
import com.ggamakun.linkle.domain.auth.dto.LoginRequestDto;
import com.ggamakun.linkle.domain.auth.dto.LoginResponseDto;
import com.ggamakun.linkle.domain.auth.dto.PasswordResponseDto;
import com.ggamakun.linkle.domain.auth.dto.RegisterResponseDto;
import com.ggamakun.linkle.domain.auth.dto.RegisterStep1RequestDto;
import com.ggamakun.linkle.domain.auth.dto.RegisterStep2RequestDto;
import com.ggamakun.linkle.domain.auth.dto.RegisterStep3RequestDto;
import com.ggamakun.linkle.domain.auth.dto.ResetPasswordRequestDto;
import com.ggamakun.linkle.domain.auth.service.AuthService;
import com.ggamakun.linkle.domain.auth.service.EmailService;
import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.domain.member.service.MemberService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "인증", description = "로그인, 회원가입 등 인증 관련 API")
public class AuthController {
    
    private final AuthService authService;
    private final MemberService memberService;
    private final EmailService emailService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request,
    		HttpServletResponse response) {
    	log.info("로그인 요청: {}", request.getEmail());
        LoginResponseDto loginResponse = authService.login(request);
        
        // Access Token을 HttpOnly Cookie로 설정
        Cookie accessTokenCookie = new Cookie("accessToken", loginResponse.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
//        accessTokenCookie.setSecure(true); // HTTPS에서만 전송
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(60 * 60); // 1시간
        response.addCookie(accessTokenCookie);
        
        // Refresh Token을 HttpOnly Cookie로 설정
        Cookie refreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
//        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 14); // 14일
        response.addCookie(refreshTokenCookie);
        
//         응답에서 토큰 제거 (쿠키로만 전송)
//        loginResponse.setAccessToken(null);
//        loginResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(loginResponse);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        // Access Token 쿠키 삭제
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setHttpOnly(true);
//        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        response.addCookie(accessTokenCookie);
        
        // Refresh Token 쿠키 삭제
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setHttpOnly(true);
//        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        response.addCookie(refreshTokenCookie);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/register/step1")
    public ResponseEntity<RegisterResponseDto> registerStep1(@RequestBody @Valid RegisterStep1RequestDto request) {
        log.info("회원가입 1단계 요청: {}", request.getEmail());
        
        // AuthService를 통해 회원 생성
        Integer memberId = authService.registerStep1(request);
        
        // 생성된 회원 정보 조회
        Member member = memberService.getMemberById(memberId);
        
        // 응답 생성
        RegisterResponseDto response = RegisterResponseDto.builder()
                .memberId(member.getMemberId())
                .email(member.getEmail())
                .name(member.getName())
                .message("회원가입 1단계가 완료되었습니다.")
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/register/step2")
    public ResponseEntity<RegisterResponseDto> registerStep2(@RequestBody @Valid RegisterStep2RequestDto request) {
        log.info("회원가입 2단계 요청 - Member ID: {}", request.getMemberId());
        
        // MemberService를 통해 기본 정보 업데이트
        memberService.updateBasicInfo(
            request.getMemberId(),
            request.getNickname(),
            request.getBirthDate(),
            request.getGender(),
            request.getSido(),
            request.getSigungu()
        );
        
        // 업데이트된 회원 정보 조회
        Member member = memberService.getMemberById(request.getMemberId());
        
        // 응답 생성
        RegisterResponseDto response = RegisterResponseDto.builder()
                .memberId(member.getMemberId())
                .email(member.getEmail())
                .name(member.getName())
                .message("회원가입 2단계가 완료되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register/step3")
    public ResponseEntity<RegisterResponseDto> registerStep3(@RequestBody @Valid RegisterStep3RequestDto request) {
        log.info("회원가입 3단계 요청 - Member ID: {}", request.getMemberId());
        
        // 관심사 목록을 "/" 구분자로 연결하여 문자열로 변환
        String interests = request.getInterests().stream()
                .map(String::valueOf)
                .collect(Collectors.joining("/"));
        
        // MemberService를 통해 관심사 업데이트
        memberService.updateInterests(request.getMemberId(), interests);
        
        // 업데이트된 회원 정보 조회
        Member member = memberService.getMemberById(request.getMemberId());
        
        emailService.sendVerificationEmail(member.getEmail());
        
        // 응답 생성
        RegisterResponseDto response = RegisterResponseDto.builder()
                .memberId(member.getMemberId())
                .email(member.getEmail())
                .name(member.getName())
                .message("회원가입이 완료되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/find-id")
    public ResponseEntity<FindIdResponseDto> findId(@RequestBody @Valid FindIdRequestDto request) {
        log.info("아이디 찾기 요청: {}", request.getEmail());
        
        String email = authService.findId(request.getEmail());
        
        FindIdResponseDto response = FindIdResponseDto.builder()
                .email(email)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResponseDto> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request) {
        log.info("비밀번호 찾기 요청: {}", request.getEmail());
        
        emailService.sendPasswordResetEmail(request.getEmail());
        
        PasswordResponseDto response = PasswordResponseDto.builder()
                .message("비밀번호 재설정 이메일이 발송되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResponseDto> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto request) {
        log.info("비밀번호 재설정 요청");
        
        authService.resetPassword(request.getToken(), request.getNewPassword());
        
        PasswordResponseDto response = PasswordResponseDto.builder()
                .message("비밀번호가 성공적으로 재설정되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
}