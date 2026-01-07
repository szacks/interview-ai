package com.example.interviewAI.service;

import com.example.interviewAI.dto.AgentTemplateResponse;
import com.example.interviewAI.dto.CreateAgentTemplateRequest;
import com.example.interviewAI.dto.UpdateAgentTemplateRequest;
import com.example.interviewAI.entity.AgentTemplate;
import com.example.interviewAI.repository.AgentTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AgentTemplateService {
    @Autowired
    private AgentTemplateRepository agentTemplateRepository;

    /**
     * Get all agents (system + company-specific)
     */
    public List<AgentTemplateResponse> getAllAgents(Long companyId) {
        return agentTemplateRepository.findByCompanyIdOrCompanyIdIsNull(companyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get agent by ID
     */
    public AgentTemplateResponse getAgentById(Long id) {
        return agentTemplateRepository.findById(id)
                .map(this::toResponse)
                .orElse(null);
    }

    /**
     * Create custom agent
     */
    public AgentTemplateResponse createCustomAgent(CreateAgentTemplateRequest request, Long userId, Long companyId) {
        AgentTemplate agent = new AgentTemplate();
        agent.setName(request.getName());
        agent.setDescription(request.getDescription());
        agent.setSystemPrompt(request.getSystemPrompt());
        agent.setIsSystem(false);
        agent.setCompanyId(companyId);
        agent.setCreatedBy(userId);
        agent.setCreatedAt(LocalDateTime.now());
        agent.setUpdatedAt(LocalDateTime.now());

        AgentTemplate savedAgent = agentTemplateRepository.save(agent);
        return toResponse(savedAgent);
    }

    /**
     * Update custom agent (system agents cannot be updated)
     */
    public AgentTemplateResponse updateAgent(Long id, UpdateAgentTemplateRequest request) {
        Optional<AgentTemplate> agentOpt = agentTemplateRepository.findById(id);
        if (agentOpt.isEmpty()) {
            return null;
        }

        AgentTemplate agent = agentOpt.get();

        // Prevent updating system templates
        if (agent.getIsSystem()) {
            throw new IllegalArgumentException("System templates cannot be updated");
        }

        if (request.getName() != null) {
            agent.setName(request.getName());
        }
        if (request.getDescription() != null) {
            agent.setDescription(request.getDescription());
        }
        if (request.getSystemPrompt() != null) {
            agent.setSystemPrompt(request.getSystemPrompt());
        }
        agent.setUpdatedAt(LocalDateTime.now());

        AgentTemplate updatedAgent = agentTemplateRepository.save(agent);
        return toResponse(updatedAgent);
    }

    /**
     * Delete custom agent (system agents cannot be deleted)
     */
    public void deleteAgent(Long id) {
        Optional<AgentTemplate> agentOpt = agentTemplateRepository.findById(id);
        if (agentOpt.isEmpty()) {
            return;
        }

        AgentTemplate agent = agentOpt.get();

        // Prevent deleting system templates
        if (agent.getIsSystem()) {
            throw new IllegalArgumentException("System templates cannot be deleted");
        }

        agentTemplateRepository.delete(agent);
    }

    /**
     * Get all system templates
     */
    public List<AgentTemplateResponse> getSystemAgents() {
        return agentTemplateRepository.findByIsSystemTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to response DTO
     */
    private AgentTemplateResponse toResponse(AgentTemplate agent) {
        return AgentTemplateResponse.builder()
                .id(agent.getId())
                .name(agent.getName())
                .description(agent.getDescription())
                .systemPrompt(agent.getSystemPrompt())
                .isSystem(agent.getIsSystem())
                .companyId(agent.getCompanyId())
                .createdBy(agent.getCreatedBy())
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
}
