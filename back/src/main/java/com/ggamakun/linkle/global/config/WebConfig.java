package com.ggamakun.linkle.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins("http://localhost:5173")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true);
	}

	// 프론트엔드 정적 리소스 제공을 위한 설정
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// 정적 리소스 경로 설정
		registry.addResourceHandler("/**")
		.addResourceLocations("classpath:/static/")
		.setCachePeriod(3600)
		.resourceChain(true);
	}
}
