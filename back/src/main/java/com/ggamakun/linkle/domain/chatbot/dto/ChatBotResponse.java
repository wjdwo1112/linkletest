package com.ggamakun.linkle.domain.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatBotResponse {
    private String response;
    private String context; // 어떤 DB 데이터를 참조했는지
    private Boolean success;
    private String errorMessage;
}