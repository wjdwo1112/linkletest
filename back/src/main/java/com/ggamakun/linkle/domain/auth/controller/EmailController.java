package com.ggamakun.linkle.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.auth.dto.VerifyEmailResponseDto;
import com.ggamakun.linkle.domain.auth.service.EmailService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth/email")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "이메일 인증", description = "이메일 인증 관련 API")
public class EmailController {
    
    private final EmailService emailService;
    
    @GetMapping("/verify")
    public ResponseEntity<VerifyEmailResponseDto> verifyEmail(@RequestParam("token") String token) {
        log.info("이메일 인증 요청: {}", token);
        emailService.verifyToken(token);
        
        VerifyEmailResponseDto response = VerifyEmailResponseDto.builder()
                .message("이메일 인증이 완료되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }
}