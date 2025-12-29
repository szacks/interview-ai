package com.example.interviewAI.service;

import com.example.interviewAI.dto.EvaluationResponse;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Service for generating PDF exports of interview evaluations.
 */
@Slf4j
@Service
public class PdfExportService {

    @Autowired
    private ScoringService scoringService;

    /**
     * Generate a PDF export of the interview evaluation.
     *
     * @param evaluation The evaluation data to export
     * @return Byte array containing the PDF content
     */
    public byte[] generateEvaluationPdf(EvaluationResponse evaluation) {
        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(byteArrayOutputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Add header
            addHeader(document, evaluation);

            // Add interview details section
            addInterviewDetails(document, evaluation);

            // Add scores section
            addScoresSection(document, evaluation);

            // Add manual assessment section
            addManualAssessmentSection(document, evaluation);

            // Add observations section
            if (evaluation.getCustomObservations() != null && !evaluation.getCustomObservations().isEmpty()) {
                addCustomObservationsSection(document, evaluation);
            }

            document.close();
            return byteArrayOutputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addHeader(Document document, EvaluationResponse evaluation) {
        Paragraph title = new Paragraph("Interview Evaluation Report")
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(title);

        Paragraph candidate = new Paragraph("Candidate: " + (evaluation.getCandidateName() != null ? evaluation.getCandidateName() : "Unknown"))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(candidate);

        Paragraph question = new Paragraph("Question: " + (evaluation.getQuestionTitle() != null ? evaluation.getQuestionTitle() : "Unknown"))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(question);
    }

    private void addInterviewDetails(Document document, EvaluationResponse evaluation) {
        Paragraph heading = new Paragraph("Interview Details")
                .setFontSize(14)
                .setBold()
                .setMarginBottom(10);
        document.add(heading);

        Table table = new Table(4);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        addTableHeader(table, "Language", "Duration (min)", "Tests Passed", "Status");
        table.addCell(evaluation.getLanguage() != null ? evaluation.getLanguage() : "N/A");
        table.addCell(String.valueOf(evaluation.getDuration() != null ? evaluation.getDuration() : 0));
        table.addCell(evaluation.getTestsPassed() + "/" + evaluation.getTestsTotal());
        table.addCell(evaluation.getInterviewStatus() != null ? evaluation.getInterviewStatus() : "N/A");

        document.add(table);
    }

    private void addScoresSection(Document document, EvaluationResponse evaluation) {
        Paragraph heading = new Paragraph("Final Score")
                .setFontSize(14)
                .setBold()
                .setMarginBottom(10);
        document.add(heading);

        int finalScore = evaluation.getFinalScore() != null ? evaluation.getFinalScore() : 0;
        String interpretation = scoringService.getScoreInterpretation(finalScore);

        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(20);

        addTableHeader(table, "Score", "Interpretation");
        table.addCell(String.valueOf(finalScore) + " / 100");
        table.addCell(interpretation);

        document.add(table);

        // Score breakdown
        Paragraph breakdownHeading = new Paragraph("Score Breakdown")
                .setFontSize(12)
                .setBold()
                .setMarginBottom(10);
        document.add(breakdownHeading);

        Table breakdown = new Table(3);
        breakdown.setWidth(UnitValue.createPercentValue(100));
        breakdown.setMarginBottom(20);

        addTableHeader(breakdown, "Component", "Score", "Weight");

        int autoScore = evaluation.getAutoScoreAdjusted() != null && evaluation.getAutoScoreAdjusted() > 0
                ? evaluation.getAutoScoreAdjusted()
                : (evaluation.getAutoScoreOriginal() != null ? evaluation.getAutoScoreOriginal() : 0);
        breakdown.addCell("Auto Score");
        breakdown.addCell(String.valueOf(autoScore) + " / 100");
        breakdown.addCell("40%");

        int manualScore = evaluation.getManualScoreNormalized() != null ? evaluation.getManualScoreNormalized() : 0;
        breakdown.addCell("Manual Score");
        breakdown.addCell(String.valueOf(manualScore) + " / 100");
        breakdown.addCell("60%");

        document.add(breakdown);
    }

    private void addManualAssessmentSection(Document document, EvaluationResponse evaluation) {
        Paragraph heading = new Paragraph("Manual Assessment (1-5 Scale)")
                .setFontSize(14)
                .setBold()
                .setMarginBottom(10);
        document.add(heading);

        // Assessment scores table
        Table table = new Table(2);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginBottom(15);

        addTableHeader(table, "Parameter", "Score");
        table.addCell("Communication");
        table.addCell(evaluation.getManualScoreCommunication() != null ? evaluation.getManualScoreCommunication() + " / 5" : "N/A");
        table.addCell("Algorithmic Thinking");
        table.addCell(evaluation.getManualScoreAlgorithmic() != null ? evaluation.getManualScoreAlgorithmic() + " / 5" : "N/A");
        table.addCell("Problem Solving");
        table.addCell(evaluation.getManualScoreProblemSolving() != null ? evaluation.getManualScoreProblemSolving() + " / 5" : "N/A");
        table.addCell("AI Collaboration");
        table.addCell(evaluation.getManualScoreAiCollaboration() != null ? evaluation.getManualScoreAiCollaboration() + " / 5" : "N/A");

        document.add(table);

        // Notes for each section
        if (hasNotes(evaluation)) {
            Paragraph notesHeading = new Paragraph("Assessment Notes")
                    .setFontSize(12)
                    .setBold()
                    .setMarginBottom(10);
            document.add(notesHeading);

            if (evaluation.getNotesCommunication() != null && !evaluation.getNotesCommunication().isEmpty()) {
                document.add(new Paragraph("Communication: " + evaluation.getNotesCommunication())
                        .setMarginBottom(8));
            }
            if (evaluation.getNotesAlgorithmic() != null && !evaluation.getNotesAlgorithmic().isEmpty()) {
                document.add(new Paragraph("Algorithmic Thinking: " + evaluation.getNotesAlgorithmic())
                        .setMarginBottom(8));
            }
            if (evaluation.getNotesProblemSolving() != null && !evaluation.getNotesProblemSolving().isEmpty()) {
                document.add(new Paragraph("Problem Solving: " + evaluation.getNotesProblemSolving())
                        .setMarginBottom(8));
            }
            if (evaluation.getNotesAiCollaboration() != null && !evaluation.getNotesAiCollaboration().isEmpty()) {
                document.add(new Paragraph("AI Collaboration: " + evaluation.getNotesAiCollaboration())
                        .setMarginBottom(20));
            }
        }
    }

    private void addCustomObservationsSection(Document document, EvaluationResponse evaluation) {
        Paragraph heading = new Paragraph("Custom Observations")
                .setFontSize(14)
                .setBold()
                .setMarginBottom(10);
        document.add(heading);

        Paragraph content = new Paragraph(evaluation.getCustomObservations())
                .setMarginBottom(20);
        document.add(content);
    }

    private void addTableHeader(Table table, String... headers) {
        for (String header : headers) {
            Cell cell = new Cell();
            cell.add(new Paragraph(header)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            cell.setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
            table.addHeaderCell(cell);
        }
    }

    private boolean hasNotes(EvaluationResponse evaluation) {
        return (evaluation.getNotesCommunication() != null && !evaluation.getNotesCommunication().isEmpty()) ||
                (evaluation.getNotesAlgorithmic() != null && !evaluation.getNotesAlgorithmic().isEmpty()) ||
                (evaluation.getNotesProblemSolving() != null && !evaluation.getNotesProblemSolving().isEmpty()) ||
                (evaluation.getNotesAiCollaboration() != null && !evaluation.getNotesAiCollaboration().isEmpty());
    }
}
