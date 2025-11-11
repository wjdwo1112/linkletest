package com.ggamakun.linkle.domain.chatbot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.chatbot.dto.ChatRequest;
import com.ggamakun.linkle.domain.chatbot.dto.ChatResponse;
import com.ggamakun.linkle.domain.chatbot.service.ChatService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "챗봇", description = "챗봇 API")
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        log.info("챗봇 요청: {}", request.getMessage());
        
        Integer memberId = null;
        if (userDetails != null) {
            memberId = userDetails.getMember().getMemberId();
        }
        
        String response = chatService.chat(request.getMessage(), memberId);
        
        return ResponseEntity.ok(new ChatResponse(response));
    }
}