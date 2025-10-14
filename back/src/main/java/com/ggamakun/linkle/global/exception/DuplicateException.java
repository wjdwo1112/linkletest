package com.ggamakun.linkle.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class DuplicateException extends RuntimeException {
    private final HttpStatus status = HttpStatus.CONFLICT;

    public DuplicateException(String message) {
        super(message);
    }
}