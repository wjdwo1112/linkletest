package com.ggamakun.linkle.domain.auth.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.member.entity.Member;
import com.ggamakun.linkle.domain.member.repository.IMemberRepository;
import com.ggamakun.linkle.global.exception.BadRequestException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final IMemberRepository memberRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${mail.verification.expiry}")
    private Integer expiryTime;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @Transactional
    public void sendVerificationEmail(String email) {
        Member member = memberRepository.findByEmailForAuth(email);
        
        if (member == null) {
            throw new BadRequestException("존재하지 않는 이메일입니다.");
        }
        
        if ("Y".equals(member.getEmailVerified())) {
            throw new BadRequestException("이미 인증된 이메일입니다.");
        }
        
        String token = generateVerificationToken();
        
        member.setVerificationToken(token);
        member.setTokenExpiryDate(Timestamp.valueOf(LocalDateTime.now().plusSeconds(expiryTime / 1000)));
        
        memberRepository.updateMember(member);
        
        sendEmail(email, token);
        
        log.info("인증 이메일 발송 완료: {}", email);
    }
    
    @Transactional
    public void verifyToken(String token) {
        Member member = memberRepository.findByVerificationToken(token);
        
        if (member == null) {
            throw new BadRequestException("유효하지 않은 인증 토큰입니다.");
        }
        
        if (member.getTokenExpiryDate().before(Timestamp.valueOf(LocalDateTime.now()))) {
            throw new BadRequestException("인증 토큰이 만료되었습니다.");
        }
        
        member.setEmailVerified("Y");
        member.setVerificationToken(null);
        member.setTokenExpiryDate(null);
        
        memberRepository.updateMember(member);
        
        log.info("이메일 인증 완료: {}", member.getEmail());
    }
    
    public boolean isVerified(String email) {
        Member member = memberRepository.findByEmailForAuth(email);
        return member != null && "Y".equals(member.getEmailVerified());
    }
    
    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
    
    private void sendEmail(String to, String token) {
    	try {
            String verificationUrl = frontendUrl + "/auth/verify-email?token=" + token;
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("[링클] 이메일 인증을 완료해주세요");
            
            String htmlContent = buildHtmlEmail(verificationUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("인증 이메일 전송 성공: {}", to);
        } catch (MessagingException e) {
            log.error("이메일 전송 실패: {}", to, e);
            throw new BadRequestException("이메일 전송에 실패했습니다.");
        }
    }
    
    private String buildHtmlEmail(String verificationUrl) {
    	return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>" +
                "    <div style='max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>" +
                "        <div style='background-color: #4ca8ff; padding: 30px; text-align: center;'>" +
                "            <h1 style='color: #ffffff; margin: 0; font-size: 28px;'>링클</h1>" +
                "        </div>" +
                "        <div style='padding: 40px 30px;'>" +
                "            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>이메일 인증</h2>" +
                "            <p style='color: #666666; line-height: 1.6; font-size: 16px;'>링클에 가입해주셔서 감사합니다.</p>" +
                "            <p style='color: #666666; line-height: 1.6; font-size: 16px;'>아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>" +
                "            <div style='text-align: center; margin: 30px 0;'>" +
                "                <a href='" + verificationUrl + "' style='display: inline-block; background-color: #4ca8ff; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;'>이메일 인증하기</a>" +
                "            </div>" +
                "            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;'>" +
                "                <p style='color: #666666; margin: 0; font-size: 14px; line-height: 1.6;'>버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣어주세요:</p>" +
                "                <p style='color: #4ca8ff; margin: 10px 0 0 0; font-size: 14px; word-break: break-all;'>" + verificationUrl + "</p>" +
                "            </div>" +
                "            <p style='color: #999999; font-size: 14px; line-height: 1.6; margin-bottom: 0;'>이 링크는 24시간 동안 유효합니다.</p>" +
                "            <p style='color: #999999; font-size: 14px; line-height: 1.6; margin-top: 10px;'>본인이 가입하지 않으셨다면 이 메일을 무시하셔도 됩니다.</p>" +
                "        </div>" +
                "        <div style='background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;'>" +
                "            <p style='color: #999999; margin: 0; font-size: 12px;'>이 메일은 링클 회원가입 시 자동으로 발송되었습니다.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
    
    /**
     * 비밀번호 재설정 이메일 발송
     */
    @Transactional
    public void sendPasswordResetEmail(String email) {
        Member member = memberRepository.findByEmailForAuth(email);
        
        if (member == null) {
            throw new BadRequestException("존재하지 않는 이메일입니다.");
        }
        
        if (member.isSocialUser()) {
            throw new BadRequestException("소셜 로그인 계정은 비밀번호 재설정을 사용할 수 없습니다.");
        }
        
        String token = generateVerificationToken();
        
        member.setVerificationToken(token);
        member.setTokenExpiryDate(Timestamp.valueOf(LocalDateTime.now().plusSeconds(expiryTime / 1000)));
        
        memberRepository.updateMember(member);
        
        sendPasswordResetEmailMessage(email, token);
        
        log.info("비밀번호 재설정 이메일 발송 완료: {}", email);
    }

    /**
     * 비밀번호 재설정 토큰 검증
     */
    public Member verifyPasswordResetToken(String token) {
        Member member = memberRepository.findByVerificationToken(token);
        
        if (member == null) {
            throw new BadRequestException("유효하지 않은 재설정 토큰입니다.");
        }
        
        if (member.getTokenExpiryDate().before(Timestamp.valueOf(LocalDateTime.now()))) {
            throw new BadRequestException("재설정 토큰이 만료되었습니다.");
        }
        
        return member;
    }

    private void sendPasswordResetEmailMessage(String to, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("[링클] 비밀번호 재설정 안내");
            
            String htmlContent = buildPasswordResetEmail(resetUrl);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("비밀번호 재설정 이메일 전송 성공: {}", to);
        } catch (MessagingException e) {
            log.error("이메일 전송 실패: {}", to, e);
            throw new BadRequestException("이메일 전송에 실패했습니다.");
        }
    }

    private String buildPasswordResetEmail(String resetUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>" +
                "    <div style='max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>" +
                "        <div style='background-color: #4ca8ff; padding: 30px; text-align: center;'>" +
                "            <h1 style='color: #ffffff; margin: 0; font-size: 28px;'>링클</h1>" +
                "        </div>" +
                "        <div style='padding: 40px 30px;'>" +
                "            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>비밀번호 재설정</h2>" +
                "            <p style='color: #666666; line-height: 1.6; font-size: 16px;'>비밀번호 재설정을 요청하셨습니다.</p>" +
                "            <p style='color: #666666; line-height: 1.6; font-size: 16px;'>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>" +
                "            <div style='text-align: center; margin: 30px 0;'>" +
                "                <a href='" + resetUrl + "' style='display: inline-block; background-color: #4ca8ff; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;'>비밀번호 재설정하기</a>" +
                "            </div>" +
                "            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;'>" +
                "                <p style='color: #666666; margin: 0; font-size: 14px; line-height: 1.6;'>버튼이 작동하지 않는 경우 아래 링크를 복사하여 브라우저에 붙여넣어주세요:</p>" +
                "                <p style='color: #4ca8ff; margin: 10px 0 0 0; font-size: 14px; word-break: break-all;'>" + resetUrl + "</p>" +
                "            </div>" +
                "            <p style='color: #999999; font-size: 14px; line-height: 1.6; margin-bottom: 0;'>이 링크는 24시간 동안 유효합니다.</p>" +
                "            <p style='color: #999999; font-size: 14px; line-height: 1.6; margin-top: 10px;'>본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.</p>" +
                "        </div>" +
                "        <div style='background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;'>" +
                "            <p style='color: #999999; margin: 0; font-size: 12px;'>이 메일은 비밀번호 재설정 요청 시 자동으로 발송되었습니다.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
    
}