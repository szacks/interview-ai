package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CandidateRequest;
import com.example.interviewAI.entity.Candidate;
import com.example.interviewAI.repository.CandidateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/candidates")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    /**
     * Get all candidates
     */
    @GetMapping
    public ResponseEntity<?> getCandidates() {
        try {
            List<Candidate> candidates = candidateRepository.findAll();
            return ResponseEntity.ok(candidates);
        } catch (Exception e) {
            log.error("Error fetching candidates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch candidates"));
        }
    }

    /**
     * Search candidates by email
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchByEmail(@RequestParam String email) {
        try {
            Optional<Candidate> candidate = candidateRepository.findByEmail(email);
            if (candidate.isPresent()) {
                return ResponseEntity.ok(candidate.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Candidate not found"));
            }
        } catch (Exception e) {
            log.error("Error searching candidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to search candidate"));
        }
    }

    /**
     * Get candidate by ID
     */
    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getCandidateById(@PathVariable Long candidateId) {
        try {
            Optional<Candidate> candidate = candidateRepository.findById(candidateId);
            if (candidate.isPresent()) {
                return ResponseEntity.ok(candidate.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Candidate not found"));
            }
        } catch (Exception e) {
            log.error("Error fetching candidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch candidate"));
        }
    }

    /**
     * Create a new candidate or return existing if email already exists
     */
    @PostMapping
    public ResponseEntity<?> createCandidate(@Valid @RequestBody CandidateRequest request) {
        try {
            // Check if candidate with this email already exists
            Optional<Candidate> existing = candidateRepository.findByEmail(request.getEmail());
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }

            // Create new candidate
            Candidate candidate = new Candidate();
            candidate.setEmail(request.getEmail());
            candidate.setName(request.getName());
            candidate.setCreatedAt(LocalDateTime.now());

            candidate = candidateRepository.save(candidate);
            return ResponseEntity.status(HttpStatus.CREATED).body(candidate);
        } catch (Exception e) {
            log.error("Error creating candidate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create candidate"));
        }
    }

    /**
     * Helper method to create error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }
}
