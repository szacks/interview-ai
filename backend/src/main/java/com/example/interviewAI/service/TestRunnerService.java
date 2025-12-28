package com.example.interviewAI.service;

import com.example.interviewAI.dto.TestCaseResult;
import com.example.interviewAI.entity.TestCase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TestRunnerService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate a test harness that wraps candidate code with test cases
     */
    public String generateTestHarness(String language, String candidateCode, List<TestCase> testCases) {
        return switch (language.toLowerCase()) {
            case "javascript", "node" -> generateJavaScriptHarness(candidateCode, testCases);
            case "python" -> generatePythonHarness(candidateCode, testCases);
            case "java" -> generateJavaHarness(candidateCode, testCases);
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    /**
     * Parse test results from stdout JSON
     */
    public List<TestCaseResult> parseResults(String stdout, List<TestCase> testCases) {
        try {
            // Find JSON in stdout (may have other output before)
            int jsonStart = stdout.lastIndexOf("{\"results\":");
            if (jsonStart == -1) {
                log.warn("No test results JSON found in stdout");
                return testCases.stream()
                        .map(tc -> TestCaseResult.builder()
                                .testCaseId(tc.getId())
                                .testName(tc.getTestName())
                                .passed(false)
                                .errorMessage("No test output received")
                                .build())
                        .collect(Collectors.toList());
            }

            String json = stdout.substring(jsonStart);
            JsonNode root = objectMapper.readTree(json);
            JsonNode resultsNode = root.get("results");

            Map<Long, TestCaseResult> resultMap = new HashMap<>();
            if (resultsNode != null && resultsNode.isArray()) {
                for (JsonNode node : resultsNode) {
                    TestCaseResult result = TestCaseResult.builder()
                            .testCaseId(node.has("testId") ? node.get("testId").asLong() : null)
                            .testName(node.has("name") ? node.get("name").asText() : "Unknown")
                            .passed(node.has("passed") && node.get("passed").asBoolean())
                            .expected(node.has("expected") ? node.get("expected").asText() : null)
                            .actual(node.has("actual") ? node.get("actual").asText() : null)
                            .errorMessage(node.has("error") ? node.get("error").asText() : null)
                            .executionTimeMs(node.has("executionTimeMs") ? node.get("executionTimeMs").asLong() : null)
                            .build();

                    if (result.getTestCaseId() != null) {
                        resultMap.put(result.getTestCaseId(), result);
                    }
                }
            }

            // Ensure all test cases have results
            return testCases.stream()
                    .map(tc -> resultMap.getOrDefault(tc.getId(),
                            TestCaseResult.builder()
                                    .testCaseId(tc.getId())
                                    .testName(tc.getTestName())
                                    .passed(false)
                                    .errorMessage("Test did not execute")
                                    .build()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to parse test results from stdout", e);
            return testCases.stream()
                    .map(tc -> TestCaseResult.builder()
                            .testCaseId(tc.getId())
                            .testName(tc.getTestName())
                            .passed(false)
                            .errorMessage("Failed to parse results: " + e.getMessage())
                            .build())
                    .collect(Collectors.toList());
        }
    }

    // ========== JavaScript Harness ==========

    private String generateJavaScriptHarness(String candidateCode, List<TestCase> testCases) {
        StringBuilder sb = new StringBuilder();

        // Candidate code first
        sb.append("// ========== CANDIDATE CODE ==========\n");
        sb.append(candidateCode);
        sb.append("\n\n// ========== TEST HARNESS ==========\n");

        // Test runner infrastructure
        sb.append("""
                const results = [];

                function runTest(testId, name, testFn) {
                  const startTime = Date.now();
                  try {
                    const result = testFn();
                    results.push({
                      testId,
                      name,
                      passed: result.passed,
                      expected: typeof result.expected === 'string' ? result.expected : JSON.stringify(result.expected),
                      actual: typeof result.actual === 'string' ? result.actual : JSON.stringify(result.actual),
                      executionTimeMs: Date.now() - startTime
                    });
                  } catch (error) {
                    results.push({
                      testId,
                      name,
                      passed: false,
                      error: error.message,
                      executionTimeMs: Date.now() - startTime
                    });
                  }
                }

                function assertEquals(expected, actual) {
                  const passed = JSON.stringify(expected) === JSON.stringify(actual);
                  return { passed, expected, actual };
                }

                """);

        // Generate test cases
        for (TestCase tc : testCases) {
            sb.append(generateJavaScriptTestCase(tc));
        }

        // Output results as JSON
        sb.append("\nconsole.log(JSON.stringify({ results }));\n");

        return sb.toString();
    }

    private String generateJavaScriptTestCase(TestCase tc) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("runTest(%d, '%s', () => {\n", tc.getId(), escapeString(tc.getTestName())));

        try {
            // Parse operations from JSON and collect stored variables (maintaining order)
            Set<String> storedVars = new java.util.LinkedHashSet<>();
            if (tc.getOperationsJson() != null && !tc.getOperationsJson().isEmpty()) {
                JsonNode operations = objectMapper.readTree(tc.getOperationsJson());
                if (operations.isArray()) {
                    for (JsonNode op : operations) {
                        // Track variables that are stored for assertions
                        if (op.has("store")) {
                            storedVars.add(op.get("store").asText());
                        }
                        sb.append("  ").append(generateJavaScriptOperation(op)).append("\n");
                    }
                }
            }

            // Parse assertions from JSON
            if (tc.getAssertionsJson() != null && !tc.getAssertionsJson().isEmpty()) {
                JsonNode assertions = objectMapper.readTree(tc.getAssertionsJson());
                sb.append("  const expected = ").append(assertions.toString()).append(";\n");

                // Build result object from stored variables
                sb.append("  const result = {};\n");
                for (String varName : storedVars) {
                    sb.append(String.format("  result['%s'] = %s;\n", varName, varName));
                }

                sb.append("  return assertEquals(expected, result);\n");
            } else {
                sb.append("  return { passed: true, expected: 'N/A', actual: 'N/A' };\n");
            }
        } catch (Exception e) {
            log.warn("Failed to parse test case JSON for test {}: {}", tc.getId(), e.getMessage());
            sb.append("  throw new Error('Failed to parse test case');\n");
        }

        sb.append("});\n\n");
        return sb.toString();
    }

    private String generateJavaScriptOperation(JsonNode op) {
        String type = op.has("type") ? op.get("type").asText() : "";

        return switch (type) {
            case "create" -> {
                String className = op.get("class").asText();
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                yield String.format("const %s = new %s(%s);", varName, className, args);
            }
            case "call" -> {
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String method = op.get("method").asText();
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                String store = op.has("store") ? op.get("store").asText() : null;
                if (store != null) {
                    yield String.format("const %s = %s.%s(%s);", store, varName, method, args);
                } else {
                    yield String.format("%s.%s(%s);", varName, method, args);
                }
            }
            case "assign" -> {
                String varName = op.get("var").asText();
                String value = op.get("value").toString();
                yield String.format("const %s = %s;", varName, value);
            }
            case "sleep" -> {
                // JavaScript doesn't have sync sleep, skip
                yield "// sleep not supported in sync JS";
            }
            default -> "// Unknown operation: " + type;
        };
    }

    // ========== Python Harness ==========

    private String generatePythonHarness(String candidateCode, List<TestCase> testCases) {
        StringBuilder sb = new StringBuilder();

        // Candidate code first
        sb.append("# ========== CANDIDATE CODE ==========\n");
        sb.append(candidateCode);
        sb.append("\n\n# ========== TEST HARNESS ==========\n");

        // Test runner infrastructure
        sb.append("""
                import json
                import time

                results = []

                def run_test(test_id, name, test_fn):
                    start_time = time.time()
                    try:
                        result = test_fn()
                        expected_str = result['expected'] if isinstance(result['expected'], str) else json.dumps(result['expected'])
                        actual_str = result['actual'] if isinstance(result['actual'], str) else json.dumps(result['actual'])
                        results.append({
                            'testId': test_id,
                            'name': name,
                            'passed': result['passed'],
                            'expected': expected_str,
                            'actual': actual_str,
                            'executionTimeMs': int((time.time() - start_time) * 1000)
                        })
                    except Exception as e:
                        results.append({
                            'testId': test_id,
                            'name': name,
                            'passed': False,
                            'error': str(e),
                            'executionTimeMs': int((time.time() - start_time) * 1000)
                        })

                def assert_equals(expected, actual):
                    passed = expected == actual
                    return {'passed': passed, 'expected': expected, 'actual': actual}

                """);

        // Generate test cases
        for (TestCase tc : testCases) {
            sb.append(generatePythonTestCase(tc));
        }

        // Output results as JSON
        sb.append("\nprint(json.dumps({'results': results}))\n");

        return sb.toString();
    }

    private String generatePythonTestCase(TestCase tc) {
        StringBuilder sb = new StringBuilder();
        String funcName = "test_" + tc.getId();

        sb.append(String.format("def %s():\n", funcName));

        try {
            // Parse operations from JSON and collect stored variables (maintaining order)
            Set<String> storedVars = new java.util.LinkedHashSet<>();
            if (tc.getOperationsJson() != null && !tc.getOperationsJson().isEmpty()) {
                JsonNode operations = objectMapper.readTree(tc.getOperationsJson());
                if (operations.isArray()) {
                    for (JsonNode op : operations) {
                        // Track variables that are stored for assertions
                        if (op.has("store")) {
                            storedVars.add(op.get("store").asText());
                        }
                        sb.append("    ").append(generatePythonOperation(op)).append("\n");
                    }
                }
            }

            if (tc.getAssertionsJson() != null && !tc.getAssertionsJson().isEmpty()) {
                JsonNode assertions = objectMapper.readTree(tc.getAssertionsJson());
                // Convert JSON to Python dict format (true -> True, false -> False)
                String pythonDict = jsonToPythonDict(assertions);
                sb.append("    expected = ").append(pythonDict).append("\n");

                // Build result dict from stored variables
                sb.append("    result = {}\n");
                for (String varName : storedVars) {
                    sb.append(String.format("    result['%s'] = %s\n", varName, varName));
                }

                sb.append("    return assert_equals(expected, result)\n");
            } else {
                sb.append("    return {'passed': True, 'expected': 'N/A', 'actual': 'N/A'}\n");
            }
        } catch (Exception e) {
            log.warn("Failed to parse test case JSON for test {}: {}", tc.getId(), e.getMessage());
            sb.append("    raise Exception('Failed to parse test case')\n");
        }

        sb.append("\n");
        sb.append(String.format("run_test(%d, '%s', %s)\n\n", tc.getId(), escapeString(tc.getTestName()), funcName));

        return sb.toString();
    }

    private String generatePythonOperation(JsonNode op) {
        String type = op.has("type") ? op.get("type").asText() : "";

        return switch (type) {
            case "create" -> {
                String className = op.get("class").asText();
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                yield String.format("%s = %s(%s)", varName, className, args);
            }
            case "call" -> {
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String method = op.get("method").asText();
                // Convert camelCase to snake_case for Python
                String pythonMethod = camelToSnakeCase(method);
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                String store = op.has("store") ? op.get("store").asText() : null;
                if (store != null) {
                    yield String.format("%s = %s.%s(%s)", store, varName, pythonMethod, args);
                } else {
                    yield String.format("%s.%s(%s)", varName, pythonMethod, args);
                }
            }
            case "assign" -> {
                String varName = op.get("var").asText();
                String value = op.get("value").toString();
                yield String.format("%s = %s", varName, value);
            }
            case "sleep" -> {
                int ms = op.get("ms").asInt();
                yield String.format("time.sleep(%f)", ms / 1000.0);
            }
            default -> "# Unknown operation: " + type;
        };
    }

    private String camelToSnakeCase(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    private String jsonToPythonDict(JsonNode node) {
        if (node.isBoolean()) {
            return node.asBoolean() ? "True" : "False";
        } else if (node.isNumber()) {
            return node.toString();
        } else if (node.isTextual()) {
            return "\"" + node.asText().replace("\"", "\\\"") + "\"";
        } else if (node.isArray()) {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < node.size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(jsonToPythonDict(node.get(i)));
            }
            sb.append("]");
            return sb.toString();
        } else if (node.isObject()) {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            var fields = node.fields();
            while (fields.hasNext()) {
                var entry = fields.next();
                if (!first) sb.append(", ");
                sb.append("\"").append(entry.getKey()).append("\": ");
                sb.append(jsonToPythonDict(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        return "None";
    }

    // ========== Java Harness ==========

    private String generateJavaHarness(String candidateCode, List<TestCase> testCases) {
        StringBuilder sb = new StringBuilder();

        // Imports must come first in Java
        sb.append("import java.util.*;\n\n");

        // Clean candidate code: remove package and import statements, make classes non-public
        String cleanedCode = candidateCode
                .replaceAll("(?m)^\\s*package\\s+[^;]+;\\s*$", "") // Remove package declarations
                .replaceAll("(?m)^\\s*import\\s+[^;]+;\\s*$", "")   // Remove import statements
                .replaceAll("(?m)\\bpublic\\s+class\\b", "static class");  // Change public class to static inner class

        // Solution/Test runner class with nested TestResult and nested candidate classes
        sb.append("""
                class Solution {
                    static class TestResult {
                        long testId;
                        String name;
                        boolean passed;
                        String expected;
                        String actual;
                        String error;
                        long executionTimeMs;

                        TestResult(long testId, String name) {
                            this.testId = testId;
                            this.name = name;
                        }
                    }

                    """);

        // Candidate code (should contain RateLimiter class) - now as inner class
        sb.append("// ========== CANDIDATE CODE ==========\n");
        sb.append(cleanedCode);
        sb.append("\n    // ========== TEST HARNESS ==========\n");

        sb.append("""
                    static List<TestResult> results = new ArrayList<>();

                    public static void main(String[] args) {
                        runAllTests();
                        printResults();
                    }

                    static void runAllTests() {
                """);

        // Generate test case calls
        for (int i = 0; i < testCases.size(); i++) {
            TestCase tc = testCases.get(i);
            sb.append(String.format("        runTest%d();\n", tc.getId()));
        }

        sb.append("    }\n\n");

        // Generate individual test methods
        for (TestCase tc : testCases) {
            sb.append(generateJavaTestCase(tc));
        }

        // Print results as JSON
        sb.append("""
                    static void printResults() {
                        StringBuilder sb = new StringBuilder();
                        sb.append("{\\"results\\":[");
                        for (int i = 0; i < results.size(); i++) {
                            TestResult r = results.get(i);
                            if (i > 0) sb.append(",");
                            sb.append("{");
                            sb.append("\\"testId\\":").append(r.testId).append(",");
                            sb.append("\\"name\\":\\"").append(escapeJson(r.name)).append("\\",");
                            sb.append("\\"passed\\":").append(r.passed).append(",");
                            if (r.expected != null) sb.append("\\"expected\\":\\"").append(escapeJson(r.expected)).append("\\",");
                            if (r.actual != null) sb.append("\\"actual\\":\\"").append(escapeJson(r.actual)).append("\\",");
                            if (r.error != null) sb.append("\\"error\\":\\"").append(escapeJson(r.error)).append("\\",");
                            sb.append("\\"executionTimeMs\\":").append(r.executionTimeMs);
                            sb.append("}");
                        }
                        sb.append("]}");
                        System.out.println(sb.toString());
                    }

                    static String escapeJson(String s) {
                        if (s == null) return "";
                        return s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n");
                    }
                }
                """);

        return sb.toString();
    }

    private String generateJavaTestCase(TestCase tc) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("    static void runTest%d() {\n", tc.getId()));
        sb.append(String.format("        TestResult result = new TestResult(%d, \"%s\");\n",
                tc.getId(), escapeString(tc.getTestName())));
        sb.append("        long startTime = System.currentTimeMillis();\n");
        sb.append("        try {\n");

        try {
            // Collect all variables used in assertions to detect which ones won't be created by operations
            Set<String> expectedVars = new HashSet<>();
            Set<String> createdVars = new HashSet<>();

            if (tc.getAssertionsJson() != null && !tc.getAssertionsJson().isEmpty()) {
                JsonNode assertions = objectMapper.readTree(tc.getAssertionsJson());
                if (assertions.isObject()) {
                    assertions.fieldNames().forEachRemaining(expectedVars::add);
                }
            }

            // Track which variables are created by operations
            if (tc.getOperationsJson() != null && !tc.getOperationsJson().isEmpty()) {
                JsonNode operations = objectMapper.readTree(tc.getOperationsJson());
                if (operations.isArray()) {
                    for (JsonNode op : operations) {
                        if (op.has("store")) {
                            createdVars.add(op.get("store").asText());
                        }
                    }
                }
            }

            // Initialize only variables that are expected but won't be created by operations
            for (String varName : expectedVars) {
                if (!createdVars.contains(varName)) {
                    sb.append("            boolean ").append(varName).append(" = false;\n");
                }
            }

            // Generate operations
            if (tc.getOperationsJson() != null && !tc.getOperationsJson().isEmpty()) {
                JsonNode operations = objectMapper.readTree(tc.getOperationsJson());
                if (operations.isArray()) {
                    for (JsonNode op : operations) {
                        String opCode = generateJavaOperation(op);
                        sb.append("            ").append(opCode);
                        // Handle newlines in multi-line operations (for assign)
                        if (opCode.contains("\n")) {
                            sb.append("\n");
                        } else {
                            sb.append("\n");
                        }
                    }
                }
            }

            // Parse expected assertions and compare
            if (tc.getAssertionsJson() != null && !tc.getAssertionsJson().isEmpty()) {
                JsonNode assertions = objectMapper.readTree(tc.getAssertionsJson());

                // Compare each assertion
                if (assertions.isObject()) {
                    sb.append("            boolean testPassed = true;\n");
                    sb.append("            StringBuilder expectedResults = new StringBuilder();\n");
                    sb.append("            StringBuilder actualResults = new StringBuilder();\n");

                    assertions.fields().forEachRemaining(entry -> {
                        String key = entry.getKey();
                        JsonNode expectedVal = entry.getValue();
                        String expectedStr = expectedVal.isBoolean() ? String.valueOf(expectedVal.asBoolean()) : expectedVal.asText();
                        sb.append(String.format("            expectedResults.append(\"%s: %s\\n\");\n", key, expectedStr));
                        sb.append(String.format("            actualResults.append(\"%s: \").append(String.valueOf(%s)).append(\"\\n\");\n", key, key));
                        sb.append(String.format("            if (!String.valueOf(%s).equals(\"%s\")) testPassed = false;\n", key, expectedStr));
                    });

                    sb.append("            result.passed = testPassed;\n");
                    sb.append("            result.expected = expectedResults.toString();\n");
                    sb.append("            result.actual = actualResults.toString();\n");
                } else {
                    sb.append("            result.expected = \"(no assertions)\";\n");
                    sb.append("            result.actual = \"(no assertions)\";\n");
                }
            } else {
                sb.append("            result.expected = \"(no assertions)\";\n");
                sb.append("            result.actual = \"(no assertions)\";\n");
            }
        } catch (Exception e) {
            log.warn("Failed to parse test case JSON for test {}: {}", tc.getId(), e.getMessage());
            sb.append("            throw new RuntimeException(\"Failed to parse test case\");\n");
        }

        sb.append("        } catch (Exception e) {\n");
        sb.append("            result.passed = false;\n");
        sb.append("            result.error = e.getMessage();\n");
        sb.append("        }\n");
        sb.append("        result.executionTimeMs = System.currentTimeMillis() - startTime;\n");
        sb.append("        results.add(result);\n");
        sb.append("    }\n\n");

        return sb.toString();
    }

    private String generateJavaOperation(JsonNode op) {
        String type = op.has("type") ? op.get("type").asText() : "";

        return switch (type) {
            case "create" -> {
                String className = op.get("class").asText();
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                yield String.format("%s %s = new %s(%s);", className, varName, className, args);
            }
            case "call" -> {
                String varName = op.has("var") ? op.get("var").asText() : "instance";
                String method = op.get("method").asText();
                String args = op.has("args") ? formatArgs(op.get("args")) : "";
                String store = op.has("store") ? op.get("store").asText() : null;
                if (store != null) {
                    yield String.format("boolean %s = %s.%s(%s);", store, varName, method, args);
                } else {
                    yield String.format("%s.%s(%s);", varName, method, args);
                }
            }
            case "assign" -> {
                // For assign, we don't need to do anything - the actual values
                // from method calls are already stored in variables
                yield "// Expected values defined above";
            }
            case "sleep" -> {
                int ms = op.get("ms").asInt();
                yield String.format("Thread.sleep(%d);", ms);
            }
            default -> "// Unknown operation: " + type;
        };
    }

    // ========== Utilities ==========

    private String formatArgs(JsonNode args) {
        if (args == null || !args.isArray()) {
            return "";
        }

        List<String> argStrings = new ArrayList<>();
        for (JsonNode arg : args) {
            if (arg.isTextual()) {
                argStrings.add("\"" + arg.asText() + "\"");
            } else {
                argStrings.add(arg.toString());
            }
        }
        return String.join(", ", argStrings);
    }

    private String escapeString(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
