package com.ggamakun.linkle.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class NotFoundException extends RuntimeException {
    private final HttpStatus status = HttpStatus.NOT_FOUND;

    public NotFoundException(String message) {
        super(message);
    }
}