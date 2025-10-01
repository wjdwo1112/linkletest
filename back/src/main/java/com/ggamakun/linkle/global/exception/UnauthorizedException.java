package com.ggamakun.linkle.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class UnauthorizedException extends RuntimeException {
	private final HttpStatus status = HttpStatus.UNAUTHORIZED;

	public UnauthorizedException(String message) {
		super(message);
	}
}
