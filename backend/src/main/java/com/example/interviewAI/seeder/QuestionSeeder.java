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

        // Question 4: Shopping Cart with Discount Rules (Medium)
        Question shoppingCart = new Question();
        shoppingCart.setTitle("Shopping Cart with Discount Rules");
        shoppingCart.setDescription("You are implementing an in-memory shopping cart for an e-commerce site.\n\n" +
                "Each item in the cart has:\n" +
                "- productId (string or number, up to you)\n" +
                "- unitPrice (decimal > 0)\n" +
                "- quantity (integer ≥ 1)\n\n" +
                "REQUIRED OPERATIONS\n\n" +
                "addItem(productId, unitPrice, quantity)\n" +
                "- If the same product with the same unitPrice already exists, increase its quantity.\n" +
                "- Otherwise, add a new item entry.\n\n" +
                "removeItem(productId, quantity)\n" +
                "- Reduce the quantity of that product.\n" +
                "- If the quantity reaches 0, remove the item entirely.\n\n" +
                "getItems()\n" +
                "- Return the items currently in the cart (format is up to you).\n\n" +
                "getSubtotal()\n" +
                "- Return the sum of unitPrice * quantity for all items, BEFORE any discounts.\n\n" +
                "getTotal()\n" +
                "- Return the final total AFTER applying the discount rules below, in this exact order.\n\n" +
                "DISCOUNT RULES\n\n" +
                "1. Generalized Buy-X-Get-Y-Free Rules (per product)\n\n" +
                "Some products may have a rule like: Buy 2 get 1 free, Buy 3 get 1 free, etc.\n" +
                "Assume you have access to a configuration: buyXGetYRules = { \"A\": { buy: 2, free: 1 }, \"B\": { buy: 3, free: 1 } ... }\n" +
                "For any product with such a rule:\n" +
                "- Group size is X + Y.\n" +
                "- For every full group, the customer pays only for X units.\n" +
                "Example: Rule = Buy 2 Get 1 Free, Quantity = 7\n" +
                "- Groups = floor(7 / 3) = 2\n" +
                "- Free units = 2\n" +
                "- Paid units = 7 - 2 = 5\n\n" +
                "2. Subtotal Discount (10%)\n\n" +
                "If the original subtotal (before discounts) is greater than 100, apply a 10% discount.\n\n" +
                "3. Maximum Combined Discount\n\n" +
                "The total discount from all rules combined must not exceed 50 (same currency as prices).\n\n" +
                "ASSUMPTIONS\n\n" +
                "- Single-threaded usage.\n" +
                "- No persistence, everything is in memory.\n" +
                "- Candidate may choose any language, style, and structure.\n" +
                "- Only the behavior above must be implemented.");
        shoppingCart.setDifficulty("medium");
        shoppingCart.setTimeLimitMinutes(45);
        shoppingCart.setSupportedLanguages("java,python,javascript");
        shoppingCart.setRequirementsJson("{\"requirements\":[" +
                "\"Implement ShoppingCart class with add/remove/get items operations\"," +
                "\"Calculate subtotal (sum of unitPrice * quantity)\"," +
                "\"Apply 10% discount if subtotal > 100\"," +
                "\"Apply buy 2 get 1 free for product A (pay for 2 out of 3)\"," +
                "\"Cap total discount at 50\"," +
                "\"Handle item updates when same productId added with same price\"]}");
        shoppingCart.setTestsJson("{\"tests\":[" +
                "{\"input\":\"Add A(price:10,qty:3)\",\"expected\":\"subtotal:30, discount:10, total:20\",\"description\":\"Buy 2 get 1 free\"}," +
                "{\"input\":\"Add items subtotal 150\",\"expected\":\"10% discount applied\",\"description\":\"Subtotal > 100\"}," +
                "{\"input\":\"Add A(10,6) + B(20,5)\",\"expected\":\"discount capped at 50\",\"description\":\"Maximum discount cap\"}," +
                "{\"input\":\"Empty cart\",\"expected\":\"subtotal:0, total:0\",\"description\":\"Empty cart\"}" +
                "]}");
        shoppingCart.setRubricJson("{\"categories\":[" +
                "{\"category\":\"Correctness\",\"points\":40,\"description\":\"All calculations correct, discounts applied properly\"}," +
                "{\"category\":\"Item Management\",\"points\":25,\"description\":\"Add/remove items work correctly, quantities updated\"}," +
                "{\"category\":\"Discount Logic\",\"points\":20,\"description\":\"All three discount rules implemented and capped correctly\"}," +
                "{\"category\":\"Code Quality\",\"points\":15,\"description\":\"Clean code structure, proper encapsulation\"}" +
                "]}");
        shoppingCart.setIntentionalBugsJson("{\"bugs\":[" +
                "{\"name\":\"Discount cap not applied\",\"description\":\"Forgets to limit total discount to 50\",\"difficulty\":\"common\"}," +
                "{\"name\":\"Buy 2 get 1 free miscalculation\",\"description\":\"Calculates discount incorrectly for product A\",\"difficulty\":\"medium\"}," +
                "{\"name\":\"Duplicate items\",\"description\":\"Doesn't update quantity when same item added twice\",\"difficulty\":\"easy\"}" +
                "]}");
        shoppingCart.setInitialCodeJava("public class ShoppingCart {\n" +
                "    public void addItem(String productId, double unitPrice, int quantity) { }\n" +
                "    public void removeItem(String productId, int quantity) { }\n" +
                "    public double getSubtotal() { return 0; }\n" +
                "    public double getTotal() { return 0; }\n" +
                "}");
        shoppingCart.setInitialCodePython("class ShoppingCart:\n" +
                "    def addItem(self, productId, unitPrice, quantity): pass\n" +
                "    def removeItem(self, productId, quantity): pass\n" +
                "    def getSubtotal(self): return 0\n" +
                "    def getTotal(self): return 0");
        shoppingCart.setInitialCodeJavascript("class ShoppingCart {\n" +
                "    addItem(productId, unitPrice, quantity) { }\n" +
                "    removeItem(productId, quantity) { }\n" +
                "    getSubtotal() { return 0; }\n" +
                "    getTotal() { return 0; }\n" +
                "}");
        shoppingCart.setCreatedAt(LocalDateTime.now());

        // Save all questions to database
        questionRepository.saveAll(Arrays.asList(twoSum, validParentheses, longestSubstring, shoppingCart));
        log.info("Successfully seeded 4 questions to database: Two Sum, Valid Parentheses, Longest Substring, Shopping Cart");
    }
}
