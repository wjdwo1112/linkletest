package com.ggamakun.linkle.domain.file.service;

import java.security.MessageDigest;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ggamakun.linkle.domain.file.dto.FileUploadResponse;
import com.ggamakun.linkle.domain.file.entity.FileStorage;
import com.ggamakun.linkle.domain.file.repository.IFileStorageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService implements IFileStorageService{

	private final IFileStorageRepository fileStorageRepository;
	
	@Override
	@Transactional
	public FileUploadResponse saveFile(String fileUrl, String originalFilename, Integer fileSize, String fileType,
			Integer uploaderId, byte[] fileBytes) {
		try {
			//파일 해시 생성(중복 방지)
			String fileHash = generateFileHash(fileBytes);
			
			
			//새 파일 저장
			FileStorage file = FileStorage.builder()
					.originalFileName(originalFilename)
					.fileLink(fileUrl)
					.fileSize(fileSize)
					.fileType(fileType)
					.uploaderId(uploaderId)
					.fileHash(fileHash)
					.createdBy(uploaderId)
					.isDeleted("N")
					.build();
			
			fileStorageRepository.insertFile(file);
			log.info("파일저장완료- FILE_ID : {}, URL :{}",file.getFileId(),fileUrl);
			
			FileStorage savedFile = fileStorageRepository.findByHash(fileHash);
			
			return FileUploadResponse.builder()
					.fileId(savedFile.getFileId())
					.fileUrl(savedFile.getFileLink())
					.originalFileName(savedFile.getOriginalFileName())
					.build();
		}catch(Exception e) {
			log.error("파일 저장 실패", e);
			throw new RuntimeException("파일 저장 실패", e);
		}
		
	}
	
	
	@Override
	public FileUploadResponse checkDuplicateFile(byte[] fileBytes) {
		try {
			//파일 바이트로 해시 생성
			String fileHash = generateFileHash(fileBytes);
			
			//중복 파일 체크
			FileStorage existingFile = fileStorageRepository.findByHash(fileHash);
			if(existingFile != null) {
				log.info("중복 파일 발견 - File_ID: {}, Hash: {]", existingFile.getFileId(), fileHash);
				return FileUploadResponse.builder()
						.fileId(existingFile.getFileId())
						.fileUrl(existingFile.getFileLink())
						.originalFileName(existingFile.getOriginalFileName())
						.build();
			}
			return null; //중복 없음
		}catch(Exception e) {
			log.error("중복 파일 체크", e);
			return null;
		}
		
	}

	@Override
	public FileStorage getFileById(Integer fileId) {
		
		return fileStorageRepository.findById(fileId);
	}

	@Override
	public List<FileStorage> getFilesByIds(List<Integer> fileIds) {
		if(fileIds == null || fileIds.isEmpty()) {
			return List.of();
		}
		return fileStorageRepository.findByIds(fileIds);
	}

	@Override
	@Transactional
	public void deleteFile(Integer fileId) {
		fileStorageRepository.deleteFile(fileId);
		log.info("파일 삭제 완료 - FILE_ID: {} ", fileId);
		
	}
	
	//파일 해시 생성(SHA-256)
	private String generateFileHash(byte[] fileBytes) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[]hash = digest.digest(fileBytes);
			StringBuilder hexString = new StringBuilder();
			for(byte b : hash) {
				String hex = Integer.toHexString(0xff & b);
				if(hex.length() == 1) hexString.append('0');
				hexString.append(hex);
			}
			return hexString.toString();
		}catch(Exception e) {
			log.error("파일 해시 생성 실패", e);
			throw new RuntimeException("파일 해시 생성에 실패", e);
		}
	}



	

}
