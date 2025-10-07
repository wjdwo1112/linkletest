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
}
