package com.example.interviewAI.controller;

import com.example.interviewAI.dto.AgentTemplateResponse;
import com.example.interviewAI.dto.CreateAgentTemplateRequest;
import com.example.interviewAI.dto.UpdateAgentTemplateRequest;
import com.example.interviewAI.service.AgentTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

/**
 * REST controller for AI agent template management.
 * Handles CRUD operations for custom and system AI agents.
 */
@Slf4j
@RestController
@RequestMapping("/agents")
@RequiredArgsConstructor
public class AgentTemplateController {

    private final AgentTemplateService agentTemplateService;

    /**
     * Get all agents (system + company-specific custom agents).
     *
     * @param authentication the authenticated user
     * @return list of all available agents
     */
    @GetMapping
    public ResponseEntity<List<AgentTemplateResponse>> getAllAgents(Authentication authentication) {
        log.debug("Fetching all agents");
        Long companyId = extractCompanyIdFromAuthentication(authentication);
        List<AgentTemplateResponse> agents = agentTemplateService.getAllAgents(companyId);
        return ResponseEntity.ok(agents);
    }

    /**
     * Get a specific agent by ID.
     *
     * @param id agent identifier
     * @return agent details
     */
    @GetMapping("/{id}")
    public ResponseEntity<AgentTemplateResponse> getAgentById(@PathVariable Long id) {
        log.debug("Fetching agent with ID: {}", id);
        AgentTemplateResponse agent = agentTemplateService.getAgentById(id);
        if (agent == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agent);
    }

    /**
     * Create a new custom agent.
     *
     * @param request the agent creation request
     * @param authentication the authenticated user
     * @return the created agent
     */
    @PostMapping
    public ResponseEntity<AgentTemplateResponse> createAgent(
            @Valid @RequestBody CreateAgentTemplateRequest request,
            Authentication authentication) {
        log.info("Creating new agent: {}", request.getName());

        Long userId = extractUserIdFromAuthentication(authentication);
        Long companyId = extractCompanyIdFromAuthentication(authentication);
        AgentTemplateResponse response = agentTemplateService.createCustomAgent(request, userId, companyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing custom agent.
     * System agents cannot be updated.
     *
     * @param id the agent ID
     * @param request the update request
     * @return the updated agent
     */
    @PutMapping("/{id}")
    public ResponseEntity<AgentTemplateResponse> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAgentTemplateRequest request) {
        log.info("Updating agent with ID: {}", id);

        try {
            AgentTemplateResponse response = agentTemplateService.updateAgent(id, request);
            if (response == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Cannot update agent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Delete a custom agent.
     * System agents cannot be deleted.
     *
     * @param id the agent ID
     * @return empty response with 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        log.info("Deleting agent with ID: {}", id);

        try {
            agentTemplateService.deleteAgent(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Cannot delete agent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * Extract user ID from authentication token.
     * Assumes the principal is a UserDetails object with username as user ID.
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            try {
                return Long.parseLong(userDetails.getUsername());
            } catch (NumberFormatException e) {
                log.warn("Could not parse user ID from username: {}", userDetails.getUsername());
                return null;
            }
        }
        return null;
    }

    /**
     * Extract company ID from authentication token.
     * This is a simplified implementation - in production, you might store company ID
     * in the token or user claims.
     */
    private Long extractCompanyIdFromAuthentication(Authentication authentication) {
        // TODO: Implement proper company ID extraction from authentication
        // For now, returning null which will filter for system templates only
        return null;
    }
}
