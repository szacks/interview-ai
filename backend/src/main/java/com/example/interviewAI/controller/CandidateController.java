package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CandidateRequest;
import com.example.interviewAI.entity.Candidate;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for candidate management operations.
 * Handles CRUD operations for candidate entities.
 */
@Slf4j
@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateRepository candidateRepository;

    /**
     * Get all candidates.
     *
     * @return list of all candidates
     */
    @GetMapping
    public ResponseEntity<List<Candidate>> getCandidates() {
        log.debug("Fetching all candidates");
        List<Candidate> candidates = candidateRepository.findAll();
        return ResponseEntity.ok(candidates);
    }

    /**
     * Search candidates by email.
     *
     * @param email candidate email to search for
     * @return candidate with matching email
     */
    @GetMapping("/search")
    public ResponseEntity<Candidate> searchByEmail(@RequestParam String email) {
        log.debug("Searching for candidate with email: {}", email);
        Candidate candidate = candidateRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "email", email));
        return ResponseEntity.ok(candidate);
    }

    /**
     * Get candidate by ID.
     *
     * @param candidateId candidate identifier
     * @return candidate details
     */
    @GetMapping("/{candidateId}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable Long candidateId) {
        log.debug("Fetching candidate with ID: {}", candidateId);
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        return ResponseEntity.ok(candidate);
    }

    /**
     * Create a new candidate or return existing if email already exists.
     *
     * @param request candidate creation details
     * @return created or existing candidate
     */
    @PostMapping
    public ResponseEntity<Candidate> createCandidate(@Valid @RequestBody CandidateRequest request) {
        log.info("Creating candidate with email: {}", request.getEmail());

        // Check if candidate with this email already exists
        return candidateRepository.findByEmail(request.getEmail())
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Create new candidate
                    Candidate candidate = new Candidate();
                    candidate.setEmail(request.getEmail());
                    candidate.setName(request.getName());
                    candidate.setCreatedAt(LocalDateTime.now());

                    Candidate saved = candidateRepository.save(candidate);
                    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                });
    }
}
