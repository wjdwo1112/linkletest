package com.ggamakun.linkle.domain.file.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ggamakun.linkle.domain.file.entity.FileStorage;

@Mapper
public interface IFileStorageRepository {
	//파일 정보 저장
	Integer insertFile(FileStorage file);
	
	//파일 ID로 조회
	FileStorage findById(Integer fileID);
	
	//파일 ID 목록으로 조회
	List<FileStorage> findByIds(@Param("fileIds") List<Integer> fileIds);
	
	//파일 삭제
	void deleteFile(Integer fileId);
	
	//파일 해시로 조회
	FileStorage findByHash(String fileHash);

	
}
