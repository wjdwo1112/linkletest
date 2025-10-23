package com.ggamakun.linkle.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class ForbiddenException extends RuntimeException {
    private final HttpStatus status = HttpStatus.FORBIDDEN;

    public ForbiddenException(String message) {
        super(message);
    }
}