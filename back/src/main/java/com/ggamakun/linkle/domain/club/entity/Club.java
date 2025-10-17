package com.ggamakun.linkle.domain.club.entity;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {
    private Integer clubId;
    private Integer fileId;
    private String name;
    private Integer leaderId;
    private String description;
    private Timestamp openedAt;
    private Timestamp closedAt;
    private Integer createdBy;
    private Timestamp createdAt;
    private Integer updatedBy;
    private Timestamp updatedAt;
    private String region;
    private Integer maxMembers;
    private Integer categoryId;
    private String isDeleted;
}