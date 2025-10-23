package com.ggamakun.linkle.domain.member.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInterestsRequestDto {
    
    @NotEmpty(message = "관심사를 최소 3개 선택해주세요.")
    @Size(min = 3, max = 5, message = "관심사는 최소 3개, 최대 5개까지 선택 가능합니다.")
    private List<Integer> interests;
}