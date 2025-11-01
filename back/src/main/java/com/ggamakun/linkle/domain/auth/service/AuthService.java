package com.ggamakun.linkle.domain.auth.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.auth.dto.LoginRequestDto;
import com.ggamakun.linkle.domain.auth.dto.LoginResponseDto;
import com.ggamakun.linkle.domain.auth.dto.RegisterStep1RequestDto;
import com.ggamakun.linkle.domain.file.entity.FileStorage;
import com.ggamakun.linkle.domain.file.repository.IFileStorageRepository;
import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.domain.member.repository.IMemberRepository;
import com.ggamakun.linkle.global.exception.BadRequestException;
import com.ggamakun.linkle.global.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final IMemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    //private final IFileStorageRepository fileStorageRepository;
    private final JwtUtil jwtUtil;
    
    /**
     * 회원가입 1단계: 이메일, 비밀번호, 이름 등록
     * @return 생성된 회원 ID
     */
    @Transactional
    public Integer registerStep1(RegisterStep1RequestDto request) {
        log.info("회원가입 1단계 시작: {}", request.getEmail());
        
        // 이메일 중복 확인
        if (memberRepository.countByEmail(request.getEmail()) > 0) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // Member 엔티티 생성
        Member member = Member.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .name(request.getName())
                .build();
        
        // DB에 저장
        int result = memberRepository.insertMember(member);
        
        if (result <= 0) {
            throw new BadRequestException("회원가입에 실패했습니다.");
        }
        
        log.info("회원가입 1단계 완료 - ID: {}, Email: {}", member.getMemberId(), member.getEmail());
        
        return member.getMemberId();
    }
    
    /**
     * 로그인
     */
    public LoginResponseDto login(LoginRequestDto request) {
        log.info("로그인 시도: {}", request.getEmail());
        
        // 회원 조회
        Member member = memberRepository.findByEmailForAuth(request.getEmail());
        
        if (member == null) {
            throw new BadRequestException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new BadRequestException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        

        // JWT 토큰 생성
        String accessToken = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
        String refreshToken = jwtUtil.createRefreshToken(member.getMemberId(), member.getEmail());
        
        log.info("로그인 성공: {}", member.getEmail());
        
        return LoginResponseDto.builder()
                .memberId(member.getMemberId())
                .email(member.getEmail())
                .name(member.getName())
                .nickname(member.getNickname())
                //fileId 추가
                .fileId(member.getFileId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message("로그인에 성공했습니다.")
                .build();
    }
    
    /**
     * 아이디 찾기
     */
    public String findId(String email) {
        log.info("아이디 찾기 요청: {}", email);
        
        Member member = memberRepository.findByEmailForAuth(email);
        
        if (member == null) {
            throw new BadRequestException("등록된 이메일을 찾을 수 없습니다.");
        }
        
        log.info("아이디 찾기 성공: {}", email);
        return maskEmail(member.getEmail());
    }
    
    /**
     * 이메일 마스킹
     * 예: user@example.com -> u***@example.com
     */
    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "";
        }
        
        int atIndex = email.indexOf("@");
        if (atIndex <= 0) {
            return email;
        }
        
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        
        if (localPart.length() <= 1) {
            return localPart + "***" + domain;
        }
        
        return localPart.charAt(0) + "***" + domain;
    }
    
    /**
     * 비밀번호 재설정
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("비밀번호 재설정 시작");
        
        Member member = memberRepository.findByVerificationToken(token);
        
        if (member == null) {
            throw new BadRequestException("유효하지 않은 재설정 토큰입니다.");
        }
        
        if (member.getTokenExpiryDate().before(Timestamp.valueOf(LocalDateTime.now()))) {
            throw new BadRequestException("재설정 토큰이 만료되었습니다.");
        }
        
        if (member.isSocialUser()) {
            throw new BadRequestException("소셜 로그인 계정은 비밀번호 재설정을 사용할 수 없습니다.");
        }
        
        String encodedPassword = passwordEncoder.encode(newPassword);
        member.setPassword(encodedPassword);
        member.setVerificationToken(null);
        member.setTokenExpiryDate(null);
        
        memberRepository.updateMember(member);
        
        log.info("비밀번호 재설정 완료: {}", member.getEmail());
    }
    
}