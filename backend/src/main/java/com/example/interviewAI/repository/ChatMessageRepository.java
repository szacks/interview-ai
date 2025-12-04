package com.example.interviewAI.repository;

import com.example.interviewAI.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChatMessage entity operations
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Find all chat messages for an interview, ordered by timestamp ascending
     * @param interviewId The interview ID
     * @return List of chat messages
     */
    List<ChatMessage> findByInterviewIdOrderByTimestampAsc(Long interviewId);

    /**
     * Find chat messages for an interview with pagination
     * @param interviewId The interview ID
     * @param pageable Pagination parameters
     * @return Page of chat messages
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.interview.id = :interviewId " +
           "ORDER BY cm.timestamp DESC")
    Page<ChatMessage> findByInterviewIdWithPagination(
        @Param("interviewId") Long interviewId,
        Pageable pageable
    );

    /**
     * Count total messages for an interview
     * @param interviewId The interview ID
     * @return Count of messages
     */
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.interview.id = :interviewId")
    Long countByInterviewId(@Param("interviewId") Long interviewId);
}
