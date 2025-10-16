package com.ggamakun.linkle.domain.file.service;

import java.util.List;

import com.ggamakun.linkle.domain.file.dto.FileUploadResponse;
import com.ggamakun.linkle.domain.file.entity.FileStorage;

public interface IFileStorageService {

	//파일 저장
	FileUploadResponse saveFile(String fileUrl, String originalFilename, Integer fileSize, String fileType,
			Integer uploaderId, byte[] fileBytes);
	
	//중복 파일 체크
	FileUploadResponse checkDuplicateFile(byte[] fileBytes);
	
	//파일 ID로 조회
	FileStorage getFileById(Integer fileId);
	
	//파일 ID 목록으로 조회
	List<FileStorage> getFilesByIds(List<Integer> fileIds);
	
	//파일 삭제
	void deleteFile(Integer fileId);
}
