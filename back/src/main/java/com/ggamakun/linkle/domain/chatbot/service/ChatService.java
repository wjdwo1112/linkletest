package com.ggamakun.linkle.domain.chatbot.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ggamakun.linkle.domain.chatbot.dto.OpenAiRequest;
import com.ggamakun.linkle.domain.chatbot.dto.OpenAiResponse;
import com.ggamakun.linkle.domain.club.dto.ClubDetailDto;
import com.ggamakun.linkle.domain.club.dto.ClubSummary;
import com.ggamakun.linkle.domain.club.dto.SearchClubDto;
import com.ggamakun.linkle.domain.club.service.IClubService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    @Value("${openai.api.key}")
    private String apiKey;
    
    @Value("${openai.api.url}")
    private String apiUrl;
    
    @Value("${openai.api.model}")
    private String model;
    
    @Value("${openai.api.max-tokens}")
    private Integer maxTokens;
    
    @Value("${openai.api.temperature}")
    private Double temperature;
    
    @Value("${openai.api.system-prompt}")
    private String systemPrompt;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final IClubService clubService;
    
    public String chat(String userMessage, Integer memberId) {
        try {
            // 1. 초기 메시지 구성
            List<OpenAiRequest.Message> messages = new ArrayList<>();
            messages.add(new OpenAiRequest.Message("system", systemPrompt, null, null, null));
            messages.add(new OpenAiRequest.Message("user", userMessage, null, null, null));
            
            // 2. Function 정의
            List<OpenAiRequest.Tool> tools = getFunctionDefinitions();
            
            // 3. OpenAI API 호출 (최대 5번 반복)
            int maxIterations = 5;
            for (int i = 0; i < maxIterations; i++) {
                OpenAiRequest request = new OpenAiRequest(
                    model,
                    messages,
                    maxTokens,
                    temperature,
                    tools,
                    "auto"
                );
                
                OpenAiResponse response = callOpenAi(request);
                OpenAiResponse.Message assistantMessage = response.getChoices().get(0).getMessage();
                String finishReason = response.getChoices().get(0).getFinishReason();
                
                // 4. Function 호출 필요 여부 확인
                if ("tool_calls".equals(finishReason) && assistantMessage.getToolCalls() != null) {
                    // Assistant 메시지 추가
                    messages.add(new OpenAiRequest.Message(
                        "assistant",
                        null,
                        assistantMessage.getToolCalls(),
                        null,
                        null
                    ));
                    
                    // 각 Function 실행 및 결과 추가
                    for (OpenAiRequest.ToolCall toolCall : assistantMessage.getToolCalls()) {
                        String functionName = toolCall.getFunction().getName();
                        String arguments = toolCall.getFunction().getArguments();
                        
                        log.info("Function 호출: {} - 인자: {}", functionName, arguments);
                        
                        String functionResult = executeFunction(functionName, arguments, memberId);
                        
                        messages.add(new OpenAiRequest.Message(
                            "tool",
                            functionResult,
                            null,
                            toolCall.getId(),
                            functionName
                        ));
                    }
                } else {
                    // 최종 응답 반환
                    return assistantMessage.getContent();
                }
            }
            
            return "죄송합니다. 요청을 처리하는 데 문제가 발생했습니다.";
            
        } catch (Exception e) {
            log.error("챗봇 처리 중 오류 발생", e);
            return "죄송합니다. 오류가 발생했습니다.";
        }
    }
    
    private List<OpenAiRequest.Tool> getFunctionDefinitions() {
        List<OpenAiRequest.Tool> tools = new ArrayList<>();
        
        // 1. searchClubs 함수
        Map<String, Object> searchClubsProps = new HashMap<>();
        searchClubsProps.put("keyword", Map.of(
            "type", "string",
            "description", "검색할 키워드 (동호회 이름, 지역, 카테고리 등)"
        ));
        
        tools.add(new OpenAiRequest.Tool(
            "function",
            new OpenAiRequest.Function(
                "searchClubs",
                "키워드로 동호회를 검색합니다. 사용자가 특정 동호회를 찾거나 지역/카테고리별 동호회를 조회할 때 사용합니다.",
                new OpenAiRequest.Parameters(
                    "object",
                    searchClubsProps,
                    Arrays.asList("keyword")
                )
            )
        ));
        
        // 2. getClubDetail 함수
        Map<String, Object> clubDetailProps = new HashMap<>();
        clubDetailProps.put("clubId", Map.of(
            "type", "integer",
            "description", "조회할 동호회 ID"
        ));
        
        tools.add(new OpenAiRequest.Tool(
            "function",
            new OpenAiRequest.Function(
                "getClubDetail",
                "특정 동호회의 상세 정보를 조회합니다.",
                new OpenAiRequest.Parameters(
                    "object",
                    clubDetailProps,
                    Arrays.asList("clubId")
                )
            )
        ));
        
        // 3. getMyClubs 함수
        tools.add(new OpenAiRequest.Tool(
            "function",
            new OpenAiRequest.Function(
                "getMyClubs",
                "사용자가 가입한 동호회 목록을 조회합니다. 로그인한 사용자만 사용 가능합니다.",
                new OpenAiRequest.Parameters(
                    "object",
                    new HashMap<>(),
                    new ArrayList<>()
                )
            )
        ));
        
        return tools;
    }
    
    private String executeFunction(String functionName, String arguments, Integer memberId) {
        try {
            switch (functionName) {
                case "searchClubs":
                    return searchClubs(arguments);
                case "getClubDetail":
                    return getClubDetail(arguments);
                case "getMyClubs":
                    return getMyClubs(memberId);
                default:
                    return "{\"error\": \"알 수 없는 함수입니다.\"}";
            }
        } catch (Exception e) {
            log.error("Function 실행 중 오류: {}", functionName, e);
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
    
    private String searchClubs(String arguments) throws Exception {
        Map<String, Object> args = objectMapper.readValue(arguments, new TypeReference<Map<String, Object>>() {});
        String keyword = (String) args.get("keyword");
        
        log.info("DB 검색 시작 - 키워드: {}", keyword);
        
        // 키워드를 공백으로 분리
        String[] keywords = keyword.split("\\s+");
        List<SearchClubDto> allClubs = new ArrayList<>();
        
        // 각 키워드로 검색하여 결과 합치기
        for (String kw : keywords) {
            List<SearchClubDto> clubs = clubService.searchClubs(kw);
            for (SearchClubDto club : clubs) {
                // 중복 제거
                if (allClubs.stream().noneMatch(c -> c.getClubId().equals(club.getClubId()))) {
                    allClubs.add(club);
                }
            }
        }
        
        log.info("DB 검색 결과 개수: {}", allClubs.size());
        
        if (allClubs.isEmpty()) {
            return "{\"message\": \"검색 결과가 없습니다.\"}";
        }
        
        return objectMapper.writeValueAsString(Map.of("clubs", allClubs));
    }
    
    private String getClubDetail(String arguments) throws Exception {
        Map<String, Object> args = objectMapper.readValue(arguments, new TypeReference<Map<String, Object>>() {});
        Integer clubId = (Integer) args.get("clubId");
        
        ClubDetailDto club = clubService.getClubDetail(clubId);
        
        if (club == null) {
            return "{\"error\": \"동호회를 찾을 수 없습니다.\"}";
        }
        
        return objectMapper.writeValueAsString(club);
    }
    
    private String getMyClubs(Integer memberId) throws Exception {
        if (memberId == null) {
            return "{\"error\": \"로그인이 필요합니다.\"}";
        }
        
        List<ClubSummary> clubs = clubService.getJoinedClubs(memberId);
        
        if (clubs.isEmpty()) {
            return "{\"message\": \"가입한 동호회가 없습니다.\"}";
        }
        
        return objectMapper.writeValueAsString(Map.of("clubs", clubs));
    }
    
    private OpenAiResponse callOpenAi(OpenAiRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        HttpEntity<OpenAiRequest> httpEntity = new HttpEntity<>(request, headers);
        
        ResponseEntity<OpenAiResponse> response = restTemplate.exchange(
            apiUrl,
            HttpMethod.POST,
            httpEntity,
            OpenAiResponse.class
        );
        
        return response.getBody();
    }
}