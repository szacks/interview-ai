package com.example.interviewAI.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ScoringService {

    /**
     * Calculate the manual score from the 4 parameters.
     * Each parameter is 0-5, total is 0-20, normalized to 0-100.
     * Formula: (sum of all params / 20) * 100
     */
    public int calculateManualScore(
            Integer communication,
            Integer algorithmic,
            Integer problemSolving,
            Integer aiCollaboration
    ) {
        int comm = communication != null ? communication : 0;
        int algo = algorithmic != null ? algorithmic : 0;
        int prob = problemSolving != null ? problemSolving : 0;
        int ai = aiCollaboration != null ? aiCollaboration : 0;

        int total = comm + algo + prob + ai; // 0-20
        int normalized = (int) Math.round((total / 20.0) * 100);

        log.debug("Manual score calculation: {}/{} + {}/{} + {}/{} + {}/{} = {}/20 = {}/100",
                comm, 5, algo, 5, prob, 5, ai, 5, total, normalized);

        return Math.min(100, Math.max(0, normalized));
    }

    /**
     * Calculate the final score from auto and manual scores.
     * Formula: (Auto Score × 0.4) + (Manual Score × 0.6)
     */
    public int calculateFinalScore(int autoScore, int manualScore) {
        int finalScore = (int) Math.round(autoScore * 0.4 + manualScore * 0.6);
        log.debug("Final score: ({} × 0.4) + ({} × 0.6) = {}", autoScore, manualScore, finalScore);
        return Math.min(100, Math.max(0, finalScore));
    }

    /**
     * Get the effective auto score (adjusted if available, otherwise original).
     */
    public int getEffectiveAutoScore(Integer original, Integer adjusted) {
        if (adjusted != null) {
            return adjusted;
        }
        return original != null ? original : 0;
    }

    /**
     * Calculate auto score from test results.
     * Basic formula: (tests passed / total tests) * 100
     */
    public int calculateAutoScoreFromTests(int testsPassed, int testsTotal) {
        if (testsTotal == 0) {
            return 0;
        }
        return (int) Math.round((testsPassed / (double) testsTotal) * 100);
    }

    /**
     * Get the score interpretation text.
     */
    public String getScoreInterpretation(int score) {
        if (score >= 91) return "Exceptional";
        if (score >= 81) return "Strong";
        if (score >= 71) return "Good";
        if (score >= 51) return "Concerning";
        return "Not Ready";
    }

    /**
     * Calculate the sum of manual scores (0-20).
     */
    public int calculateManualScoreTotal(
            Integer communication,
            Integer algorithmic,
            Integer problemSolving,
            Integer aiCollaboration
    ) {
        int comm = communication != null ? communication : 0;
        int algo = algorithmic != null ? algorithmic : 0;
        int prob = problemSolving != null ? problemSolving : 0;
        int ai = aiCollaboration != null ? aiCollaboration : 0;
        return comm + algo + prob + ai;
    }
}
