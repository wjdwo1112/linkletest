package com.ggamakun.linkle.domain.chatbot.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OpenAiResponse {
    private List<Choice> choices;
    
    @Getter
    @NoArgsConstructor
    public static class Choice {
        private Message message;
        @JsonProperty("finish_reason")
        private String finishReason; // "stop", "tool_calls"
    }
    
    @Getter
    @NoArgsConstructor
    public static class Message {
        private String role;
        private String content;
        @JsonProperty("tool_calls")
        private List<OpenAiRequest.ToolCall> toolCalls;
    }
}