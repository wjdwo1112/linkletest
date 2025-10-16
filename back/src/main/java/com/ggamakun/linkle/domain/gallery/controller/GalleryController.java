package com.ggamakun.linkle.domain.gallery.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.gallery.dto.GalleryDto;
import com.ggamakun.linkle.domain.gallery.service.IGalleryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/gallery")
public class GalleryController {
	private final IGalleryService galleryService;
	
	@GetMapping("list")
	public List<GalleryDto> GalleryList(){
		return galleryService.galleryList();
	}
}
