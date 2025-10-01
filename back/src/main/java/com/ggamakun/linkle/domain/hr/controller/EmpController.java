package com.ggamakun.linkle.domain.hr.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.hr.service.IEmpService;

@RestController
@RequestMapping("/hr")
public class EmpController {

	@Autowired
	IEmpService empService;
	
	@GetMapping
	public String test() {
		return empService.test();
	}

}
