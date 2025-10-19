package com.ggamakun.linkle.domain.like.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ILikeRepository {
	int cancelPostLike(@Param("postId") Integer postId, @Param("memberId") Integer memberId);
	int insertPostLike(@Param("postId") Integer postId, @Param("memberId") Integer memberId);
	int countPostLikes(@Param("postId") Integer postId);
	int existsPostLike(@Param("postId") Integer postId, @Param("memberId") Integer memberId);
	int reactivatePostLike(@Param("postId") Integer postId, @Param("memberId") Integer memberId);
	
	
	int cancelCommentLike(@Param("commentId") Integer commentId, @Param("memberId") Integer memberId);
	int insertCommentLike(@Param("commentId") Integer commentId, @Param("memberId") Integer memberId);
	int existsCommentLike(@Param("commentId") Integer commentId, @Param("memberId") Integer memberId);
	int reactivateCommentLike(@Param("commentId") Integer commentId, @Param("memberId") Integer memberId);
	
	// 갤러리 좋아요 취소
	int cancelGalleryLike(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);
	// 갤러리 좋아요 재활성화
	int reactivateGalleryLike(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);
	// 갤러리 좋아요 추가
	void insertGalleryLike(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);
	// 갤러리 좋아요 존재 여부
	int existsGalleryLike(@Param("galleryId") Integer galleryId, @Param("memberId") Integer memberId);
	
}
