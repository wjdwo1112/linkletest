package com.ggamakun.linkle.domain.chatbot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatBotService {

    private final OpenAIClient openAIClient;
    private final DataRetrievalService dataRetrievalService;

    @Value("${openai.model}")
    private String model;

    public String chat(String userMessage, Integer memberId) {
        try {
            String context = dataRetrievalService.buildContextForPrompt(memberId, userMessage);
            
            String systemContent = "당신은 동호회 관리 플랫폼의 AI 도우미입니다. " +
                    "사용자의 동호회 활동을 돕고, 일정 관리와 멤버 관리에 대한 조언을 제공합니다. " +
                    "다음은 현재 사용자의 정보입니다:\n\n" + context;
            
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .model(model)
                    .addSystemMessage(systemContent)
                    .addUserMessage(userMessage)
                    .temperature(0.7)
                    .maxTokens(500)
                    .build();
            
            ChatCompletion completion = openAIClient.chat().completions().create(params);
            
            return completion.choices().get(0).message().content().orElse("응답을 생성할 수 없습니다.");
            
        } catch (Exception e) {
            log.error("OpenAI API 호출 중 오류 발생", e);
            throw new RuntimeException("AI 응답 생성 중 오류가 발생했습니다.");
        }
    }
}