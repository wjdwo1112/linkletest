package com.ggamakun.linkle.domain.chatbot.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
public class OpenAiRequest {
    private String model;
    private List<Message> messages;
    @JsonProperty("max_tokens")
    private Integer maxTokens;
    private Double temperature;
    private List<Tool> tools;
    @JsonProperty("tool_choice")
    private String toolChoice; // "auto" or "none"
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Message {
        private String role; // system, user, assistant, tool
        private String content;
        @JsonProperty("tool_calls")
        private List<ToolCall> toolCalls;
        @JsonProperty("tool_call_id")
        private String toolCallId;
        private String name; // function name for tool response
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Tool {
        private String type; // "function"
        private Function function;
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Function {
        private String name;
        private String description;
        private Parameters parameters;
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Parameters {
        private String type; // "object"
        private Object properties;
        private List<String> required;
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ToolCall {
        private String id;
        private String type; // "function"
        private FunctionCall function;
    }
    
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FunctionCall {
        private String name;
        private String arguments; // JSON string
    }
}