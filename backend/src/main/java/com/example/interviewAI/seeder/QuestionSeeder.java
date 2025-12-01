package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.QuestionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Slf4j
@Component
public class QuestionSeeder implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if no questions exist
        if (questionRepository.count() > 0) {
            log.info("Questions already exist in database, skipping seeding");
            return;
        }

        log.info("Starting question database seeding...");
        seedQuestions();
        log.info("Question seeding completed successfully");
    }

    private void seedQuestions() {
        // Question 1: Two Sum (Easy)
        Question twoSum = new Question();
        twoSum.setTitle("Two Sum");
        twoSum.setDescription("Given an array of integers nums and an integer target, " +
                "return the indices of the two numbers that add up to the target. " +
                "You may assume that each input has exactly one solution, and you may not use the same element twice. " +
                "You can return the answer in any order.");
        twoSum.setDifficulty("easy");
        twoSum.setTimeLimitMinutes(30);
        twoSum.setSupportedLanguages("java,python,javascript");
        twoSum.setRequirementsJson("{\"requirements\":[\"Find two numbers in array that sum to target\"," +
                "\"Return indices of the two numbers\",\"Time complexity should be O(n) or better\"," +
                "\"Space complexity O(n) acceptable\"]}");
        twoSum.setTestsJson("{\"tests\":[" +
                "{\"input\":\"[2,7,11,15]\",\"target\":\"9\",\"expected\":\"[0,1]\",\"description\":\"Basic case\"}," +
                "{\"input\":\"[3,2,4]\",\"target\":\"6\",\"expected\":\"[1,2]\",\"description\":\"Different order\"}," +
                "{\"input\":\"[3,3]\",\"target\":\"6\",\"expected\":\"[0,1]\",\"description\":\"Duplicate numbers\"}," +
                "{\"input\":\"[1,2,3,4,5]\",\"target\":\"9\",\"expected\":\"[3,4]\",\"description\":\"Larger array\"}," +
                "{\"input\":\"[-1,0,1,2,-1,-4]\",\"target\":\"-1\",\"expected\":\"[0,3]\",\"description\":\"Negative numbers\"}" +
                "]}");
        twoSum.setRubricJson("{\"categories\":[" +
                "{\"category\":\"Correctness\",\"points\":40,\"description\":\"Solution produces correct results for all test cases\"}," +
                "{\"category\":\"Efficiency\",\"points\":30,\"description\":\"Uses HashMap for O(n) time complexity\"}," +
                "{\"category\":\"Code Quality\",\"points\":20,\"description\":\"Clean, readable code with proper variable names\"}," +
                "{\"category\":\"Edge Cases\",\"points\":10,\"description\":\"Handles edge cases like duplicates\"}" +
                "]}");
        twoSum.setIntentionalBugsJson("{\"bugs\":[" +
                "{\"name\":\"Off-by-one error\",\"description\":\"Returning [0,0] instead of finding correct indices\",\"difficulty\":\"common\"}," +
                "{\"name\":\"Missing HashMap\",\"description\":\"Nested loop causing O(n²) instead of O(n)\",\"difficulty\":\"medium\"}," +
                "{\"name\":\"Null pointer\",\"description\":\"Not checking if array is empty or null\",\"difficulty\":\"easy\"}" +
                "]}");
        twoSum.setInitialCodeJava("public int[] twoSum(int[] nums, int target) {\n" +
                "    // TODO: Implement solution\n" +
                "    return new int[2];\n" +
                "}");
        twoSum.setInitialCodePython("def twoSum(nums, target):\n" +
                "    # TODO: Implement solution\n" +
                "    return []");
        twoSum.setInitialCodeJavascript("function twoSum(nums, target) {\n" +
                "    // TODO: Implement solution\n" +
                "    return [];\n" +
                "}");
        twoSum.setCreatedAt(LocalDateTime.now());

        // Question 2: Valid Parentheses (Medium)
        Question validParentheses = new Question();
        validParentheses.setTitle("Valid Parentheses");
        validParentheses.setDescription("Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', " +
                "determine if the input string is valid. An input string is valid if: " +
                "1) Open brackets must be closed by the same type of brackets " +
                "2) Open brackets must be closed in the correct order " +
                "3) Every close bracket has a corresponding open bracket of the same type.");
        validParentheses.setDifficulty("medium");
        validParentheses.setTimeLimitMinutes(30);
        validParentheses.setSupportedLanguages("java,python,javascript");
        validParentheses.setRequirementsJson("{\"requirements\":[\"Check if parentheses/brackets are properly matched and ordered\"," +
                "\"Return true if valid, false otherwise\",\"Handle all three bracket types: (), {}, []\",\"Must use stack data structure\"]}");
        validParentheses.setTestsJson("{\"tests\":[" +
                "{\"input\":\"()\",\"target\":\"\",\"expected\":\"true\",\"description\":\"Simple parentheses\"}," +
                "{\"input\":\"()[]{}\",\"target\":\"\",\"expected\":\"true\",\"description\":\"All bracket types\"}," +
                "{\"input\":\"(]\",\"target\":\"\",\"expected\":\"false\",\"description\":\"Mismatched brackets\"}," +
                "{\"input\":\"([{}])\",\"target\":\"\",\"expected\":\"true\",\"description\":\"Nested brackets\"}," +
                "{\"input\":\"\",\"target\":\"\",\"expected\":\"true\",\"description\":\"Empty string\"}," +
                "{\"input\":\"[\",\"target\":\"\",\"expected\":\"false\",\"description\":\"Unclosed bracket\"}" +
                "]}");
        validParentheses.setRubricJson("{\"categories\":[" +
                "{\"category\":\"Correctness\",\"points\":35,\"description\":\"All test cases pass\"}," +
                "{\"category\":\"Stack Usage\",\"points\":25,\"description\":\"Properly uses stack for bracket matching\"}," +
                "{\"category\":\"Edge Cases\",\"points\":20,\"description\":\"Handles empty strings and single brackets\"}," +
                "{\"category\":\"Code Quality\",\"points\":20,\"description\":\"Clear logic and variable naming\"}" +
                "]}");
        validParentheses.setIntentionalBugsJson("{\"bugs\":[" +
                "{\"name\":\"No stack\",\"description\":\"Checks brackets without using a stack\",\"difficulty\":\"medium\"}," +
                "{\"name\":\"Empty check\",\"description\":\"Fails on empty string or doesn't check stack empty at end\",\"difficulty\":\"common\"}," +
                "{\"name\":\"Type mismatch\",\"description\":\"Returns true for mismatched bracket types\",\"difficulty\":\"medium\"}" +
                "]}");
        validParentheses.setInitialCodeJava("public boolean isValid(String s) { return true; }");
        validParentheses.setInitialCodePython("def isValid(s): return True");
        validParentheses.setInitialCodeJavascript("function isValid(s) { return true; }");
        validParentheses.setCreatedAt(LocalDateTime.now());

        // Question 3: Longest Substring Without Repeating Characters (Medium)
        Question longestSubstring = new Question();
        longestSubstring.setTitle("Longest Substring Without Repeating Characters");
        longestSubstring.setDescription("Given a string s, find the length of the longest substring without repeating characters. " +
                "A substring is a contiguous sequence of characters within a string.");
        longestSubstring.setDifficulty("medium");
        longestSubstring.setTimeLimitMinutes(35);
        longestSubstring.setSupportedLanguages("java,python,javascript");
        longestSubstring.setRequirementsJson("{\"requirements\":[\"Find the longest substring without repeating characters\"," +
                "\"Return the length of the substring\",\"Use sliding window approach for O(n) solution\"," +
                "\"Handle Unicode characters correctly\"]}");
        longestSubstring.setTestsJson("{\"tests\":[" +
                "{\"input\":\"abcabcbb\",\"target\":\"\",\"expected\":\"3\",\"description\":\"Length of abc\"}," +
                "{\"input\":\"bbbbb\",\"target\":\"\",\"expected\":\"1\",\"description\":\"Single character\"}," +
                "{\"input\":\"pwwkew\",\"target\":\"\",\"expected\":\"3\",\"description\":\"Length of wke\"}," +
                "{\"input\":\"\",\"target\":\"\",\"expected\":\"0\",\"description\":\"Empty string\"}," +
                "{\"input\":\"au\",\"target\":\"\",\"expected\":\"2\",\"description\":\"Two characters\"}," +
                "{\"input\":\"dvdf\",\"target\":\"\",\"expected\":\"3\",\"description\":\"Length of vdf\"}" +
                "]}");
        longestSubstring.setRubricJson("{\"categories\":[" +
                "{\"category\":\"Correctness\",\"points\":35,\"description\":\"All test cases pass with correct length\"}," +
                "{\"category\":\"Efficiency\",\"points\":30,\"description\":\"Uses sliding window for O(n) time complexity\"}," +
                "{\"category\":\"Logic\",\"points\":20,\"description\":\"Proper tracking of character positions\"}," +
                "{\"category\":\"Edge Cases\",\"points\":15,\"description\":\"Handles empty strings and single chars\"}" +
                "]}");
        longestSubstring.setIntentionalBugsJson("{\"bugs\":[" +
                "{\"name\":\"No sliding window\",\"description\":\"Uses brute force O(n^3) instead of sliding window\",\"difficulty\":\"hard\"}," +
                "{\"name\":\"Index tracking\",\"description\":\"Incorrectly updates left pointer in sliding window\",\"difficulty\":\"medium\"}," +
                "{\"name\":\"Max length\",\"description\":\"Returns wrong max or doesn't track correctly\",\"difficulty\":\"common\"}" +
                "]}");
        longestSubstring.setInitialCodeJava("public int lengthOfLongestSubstring(String s) { return 0; }");
        longestSubstring.setInitialCodePython("def lengthOfLongestSubstring(s): return 0");
        longestSubstring.setInitialCodeJavascript("function lengthOfLongestSubstring(s) { return 0; }");
        longestSubstring.setCreatedAt(LocalDateTime.now());

        // Save all questions to database
        questionRepository.saveAll(Arrays.asList(twoSum, validParentheses, longestSubstring));
        log.info("Successfully seeded 3 questions to database: Two Sum, Valid Parentheses, Longest Substring");
    }
}
