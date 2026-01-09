package com.example.interviewAI.service;

import com.example.interviewAI.entity.CompanySettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringService {
    private final ScoringSettingsService scoringSettingsService;

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
     * Calculate the final score from auto and manual scores using company-specific settings.
     * Formula: (Auto Score × autoWeight) + (Manual Score × manualWeight)
     * Weights are retrieved from ScoringSettings for the company.
     */
    public int calculateFinalScore(int autoScore, int manualScore, Long companyId) {
        Double autoWeight = scoringSettingsService.getAutoScoreWeight(companyId);
        Double manualWeight = scoringSettingsService.getManualScoreWeight(companyId);

        int finalScore = (int) Math.round(autoScore * autoWeight + manualScore * manualWeight);
        log.debug("Final score (with company settings): ({} × {}) + ({} × {}) = {}",
                autoScore, autoWeight, manualScore, manualWeight, finalScore);
        return Math.min(100, Math.max(0, finalScore));
    }

    /**
     * Calculate the final score from auto and manual scores using default weights.
     * Formula: (Auto Score × 0.4) + (Manual Score × 0.6)
     * Used when company ID is not available or for backward compatibility.
     */

    /**
     * Calculate the final score from auto and manual scores using company-specific weights.
     * Formula: (Auto Score × autoWeight) + (Manual Score × manualWeight)
     */
    public int calculateFinalScore(int autoScore, int manualScore, CompanySettings settings) {
        double autoWeight = settings.getAutoScoreWeight() / 100.0;
        double manualWeight = settings.getManualScoreWeight() / 100.0;
        return calculateFinalScore(autoScore, manualScore, autoWeight, manualWeight);
    }

    /**
     * Calculate the final score from auto and manual scores using custom weights.
     */
    public int calculateFinalScore(int autoScore, int manualScore, double autoWeight, double manualWeight) {
        int finalScore = (int) Math.round(autoScore * autoWeight + manualScore * manualWeight);
        log.debug("Final score: ({} × {}) + ({} × {}) = {}", autoScore, autoWeight, manualScore, manualWeight, finalScore);
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
     * Get the score interpretation text using company-specific thresholds.
     */
    public String getScoreInterpretation(int score, CompanySettings settings) {
        return getScoreInterpretation(score,
                settings.getScoreExceptionalThreshold(),
                settings.getScoreStrongThreshold(),
                settings.getScoreGoodThreshold(),
                settings.getScoreConcerningThreshold());
    }

    /**
     * Get the score interpretation text using custom thresholds.
     */
    public String getScoreInterpretation(int score, int exceptionalThreshold,
            int strongThreshold, int goodThreshold, int concerningThreshold) {
        if (score >= exceptionalThreshold) return "Exceptional";
        if (score >= strongThreshold) return "Strong";
        if (score >= goodThreshold) return "Good";
        if (score >= concerningThreshold) return "Concerning";
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
