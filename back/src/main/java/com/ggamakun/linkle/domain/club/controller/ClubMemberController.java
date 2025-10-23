package com.ggamakun.linkle.domain.club.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ggamakun.linkle.domain.club.dto.ApproveRejectRequest;
import com.ggamakun.linkle.domain.club.dto.ClubMemberDto;
import com.ggamakun.linkle.domain.club.dto.RemoveMemberRequest;
import com.ggamakun.linkle.domain.club.dto.UpdateMemberRoleRequest;
import com.ggamakun.linkle.domain.club.service.IClubMemberService;
import com.ggamakun.linkle.global.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "동호회 회원 관리", description = "동호회 회원 관리 API")
public class ClubMemberController {

    private final IClubMemberService clubMemberService;

    @GetMapping("/clubs/{clubId}/members")
    public ResponseEntity<List<ClubMemberDto>> getClubMembers(
            @PathVariable("clubId") Integer clubId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        List<ClubMemberDto> members = clubMemberService.getClubMembers(clubId, currentMemberId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/clubs/{clubId}/members/waiting")
    public ResponseEntity<List<ClubMemberDto>> getWaitingMembers(
            @PathVariable("clubId") Integer clubId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        List<ClubMemberDto> members = clubMemberService.getWaitingMembers(clubId, currentMemberId);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/clubs/{clubId}/members/role")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable("clubId") Integer clubId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        clubMemberService.updateMemberRole(clubId, request.getMemberId(), request.getRole(), currentMemberId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/clubs/{clubId}/members/remove")
    public ResponseEntity<Void> removeMember(
            @PathVariable("clubId") Integer clubId,
            @Valid @RequestBody RemoveMemberRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        clubMemberService.removeMember(clubId, request.getMemberId(), request.getReason(), 
                                      request.getAllowRejoin(), currentMemberId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/clubs/{clubId}/members/approve")
    public ResponseEntity<Void> approveMember(
            @PathVariable("clubId") Integer clubId,
            @Valid @RequestBody ApproveRejectRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        clubMemberService.approveMember(clubId, request.getMemberId(), currentMemberId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/clubs/{clubId}/members/reject")
    public ResponseEntity<Void> rejectMember(
            @PathVariable("clubId") Integer clubId,
            @Valid @RequestBody ApproveRejectRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Integer currentMemberId = userDetails.getMember().getMemberId();
        clubMemberService.rejectMember(clubId, request.getMemberId(), 
                                      request.getRejectionReason(), currentMemberId);
        return ResponseEntity.ok().build();
    }
}