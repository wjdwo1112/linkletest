package com.ggamakun.linkle.domain.chatbot.dto;

import lombok.Data;

@Data
public class ChatBotRequest {
    private String message;
    private Integer memberId; // 사용자 맥락 조회용
}