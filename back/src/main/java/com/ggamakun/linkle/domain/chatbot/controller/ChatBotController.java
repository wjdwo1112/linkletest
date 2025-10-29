package com.ggamakun.linkle.domain.chatbot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.chatbot.dto.ChatBotRequest;
import com.ggamakun.linkle.domain.chatbot.dto.ChatBotResponse;
import com.ggamakun.linkle.domain.chatbot.service.ChatBotService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "ChatBot", description = "AI 챗봇 API")
public class ChatBotController {

    private final ChatBotService aiChatService;

    @PostMapping
    public ResponseEntity<ChatBotResponse> chat(
            @RequestBody ChatBotRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
        	Integer memberId = userDetails.getMember().getMemberId();
            String response = aiChatService.chat(request.getMessage(), memberId);
            
            return ResponseEntity.ok(new ChatBotResponse(response, null, true, null));
            
        } catch (Exception e) {
            log.error("AI 챗봇 요청 처리 중 오류 발생", e);
            return ResponseEntity.ok(new ChatBotResponse(null, null, false, "요청 처리 중 오류가 발생했습니다."));
        }
    }
}