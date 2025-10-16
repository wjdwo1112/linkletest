package com.ggamakun.linkle.domain.file.entity;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileStorage {
	private Integer fileId;
	private String originalFileName;
	private String fileLink;
	private Integer fileSize;
	private String fileType;
	private Integer uploaderId;
	private String fileHash;
	private Integer createdBy;
	private Date createdAt;
	private Integer updatedBy;
	private Date updatedAt;
	private String isDeleted;
	
}
