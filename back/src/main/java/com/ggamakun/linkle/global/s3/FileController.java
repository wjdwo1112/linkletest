package com.ggamakun.linkle.global.s3;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "파일 관리", description = "파일 업로드/삭제 API")
public class FileController {

    private final S3Service s3Service;

    @PostMapping("/upload")
    @Operation(summary = "파일 업로드", description = "S3에 파일을 업로드합니다.")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = s3Service.uploadFile(file);
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            return ResponseEntity.badRequest().body("파일 업로드 실패");
        }
    }

    @DeleteMapping("/delete")
    @Operation(summary = "파일 삭제", description = "S3에서 파일을 삭제합니다.")
    public ResponseEntity<String> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            s3Service.deleteFile(fileUrl);
            return ResponseEntity.ok("파일 삭제 완료");
        } catch (Exception e) {
            log.error("파일 삭제 실패", e);
            return ResponseEntity.badRequest().body("파일 삭제 실패");
        }
    }
}