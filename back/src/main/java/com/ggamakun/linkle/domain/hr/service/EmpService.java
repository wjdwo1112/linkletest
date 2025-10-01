package com.ggamakun.linkle.domain.hr.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ggamakun.linkle.domain.hr.repository.IEmpRepository;

@Service
public class EmpService implements IEmpService {

	@Autowired
	IEmpRepository empRepository;

	@Override
	public String test() {
		return empRepository.test();
	}

}
