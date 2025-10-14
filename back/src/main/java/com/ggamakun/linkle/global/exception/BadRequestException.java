package com.ggamakun.linkle.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class BadRequestException extends RuntimeException {
    private final HttpStatus status = HttpStatus.BAD_REQUEST;

    public BadRequestException(String message) {
        super(message);
    }
}