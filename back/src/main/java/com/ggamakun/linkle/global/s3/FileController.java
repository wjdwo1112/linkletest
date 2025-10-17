package com.ggamakun.linkle.global.s3;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ggamakun.linkle.domain.file.dto.FileUploadResponse;
import com.ggamakun.linkle.domain.file.entity.FileStorage;
import com.ggamakun.linkle.domain.file.service.IFileStorageService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
    private final IFileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(
            summary = "파일 업로드", 
            description = "S3에 파일을 업로드하고 DB에 파일 정보를 저장합니다. fileId를 반환합니다.",
            security = @SecurityRequirement(name = "JWT")
        )
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file,
    										 @Parameter(hidden = true)@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
        	
        	
        	//사용자 ID 가져오기
        	Integer uploaderId = userDetails != null ? userDetails.getMember().getMemberId() : null;
        	log.info("멤버아이디 :{}",uploaderId);
        	
        	//파일 바이트로 해시 생성 후 중복 체크
        	byte[] fileBytes = file.getBytes();
        	FileUploadResponse existingFile = fileStorageService.checkDuplicateFile(fileBytes);
        	
        	//중복 파일이 없으면 기존 파일 정보 반환
        	if(existingFile != null) {
        		log.info("중복 파일 발견, 기존 FILE_ID 반환: {} ", existingFile.getFileId());
        		return ResponseEntity.ok(existingFile);
        	}
        	
        	//중복 아니면 S3에 파일 업로드
            String fileUrl = s3Service.uploadFile(file);
            log.info("S3 업로드 성공, URL: {}", fileUrl);
            
            //DB에 파일 정보 저장
            FileUploadResponse response = fileStorageService.saveFile(
            		fileUrl,
            		file.getOriginalFilename(),
            		(int)file.getSize(),
            		file.getContentType(),
            		uploaderId,
            		fileBytes
            );
            
            log.info("파일 업로드 완료 - FILE_ID : {}", response.getFileId());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{fileid}")
    @Operation(summary = "파일 정보 조회", description = "파일 ID로 파일 정보를 조회합니다.")
    public ResponseEntity<FileStorage> getFile(@PathVariable("fileid") Integer fileId){
    	FileStorage file = fileStorageService.getFileById(fileId);
    	if(file == null) {
    		return ResponseEntity.notFound().build();
    	}
    	return ResponseEntity.ok(file);
    }

    @DeleteMapping("/{fileid}")
    @Operation(
            summary = "파일 삭제", 
            description = "S3에서 파일을 삭제하고 DB에서도 소프트 삭제합니다.",
            security = @SecurityRequirement(name = "JWT")
        )
    public ResponseEntity<String> deleteFile(@PathVariable("fileid") Integer fileId) {
    	
        try {
        	//DB에서 파일 정보 조회
        	FileStorage file = fileStorageService.getFileById(fileId);
        	if(file == null) {
        		return ResponseEntity.notFound().build();
        	}
        	
        	//s3에서 파일 삭제
            s3Service.deleteFile(file.getFileLink());
            
            //DB에서 삭제
            fileStorageService.deleteFile(fileId);
            return ResponseEntity.ok("파일 삭제 완료");
        } catch (Exception e) {
            log.error("파일 삭제 실패", e);
            return ResponseEntity.badRequest().body("파일 삭제 실패");
        }
    }
}