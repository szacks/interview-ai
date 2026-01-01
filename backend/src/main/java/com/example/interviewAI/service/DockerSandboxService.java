package com.example.interviewAI.service;

import com.example.interviewAI.config.DockerProperties;
import com.example.interviewAI.config.SandboxExecutionProperties;
import com.example.interviewAI.dto.DockerExecutionResult;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Volume;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.TimeUnit;

/**
 * Service for executing code in isolated Docker containers.
 * All security and resource limits are externalized via SandboxExecutionProperties.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DockerSandboxService {

    private final DockerProperties dockerProperties;
    private final SandboxExecutionProperties executionProperties;
    private final DockerClient dockerClient;

    public DockerExecutionResult execute(String language, String code) {
        String imageName = getImageForLanguage(language);
        String containerId = null;
        Path tempDir = null;
        long startTime = System.currentTimeMillis();

        try {
            // Create temp directory for code
            tempDir = Files.createTempDirectory("sandbox-");
            String fileName = getFileNameForLanguage(language);
            Path codeFile = tempDir.resolve(fileName);
            Files.writeString(codeFile, code);

            // Make file and directory world readable and writable
            try {
                Files.setPosixFilePermissions(codeFile,
                    java.nio.file.attribute.PosixFilePermissions.fromString("rw-rw-rw-"));
                Files.setPosixFilePermissions(tempDir,
                    java.nio.file.attribute.PosixFilePermissions.fromString("rwxrwxrwx"));
            } catch (UnsupportedOperationException e) {
                // Permissions not supported on this OS, skip
                log.debug("POSIX permissions not supported, skipping chmod");
            }

            String hostPath = tempDir.toAbsolutePath().toString();
            log.info("Created temp code file: {} exists: {}", codeFile, Files.exists(codeFile));
            log.info("Host path for Docker bind: {}", hostPath);

            // Create Bind mount
            Bind bind = new Bind(hostPath, new Volume("/app"));
            log.info("Bind string representation: {}", bind.toString());

            CreateContainerResponse container = dockerClient.createContainerCmd(imageName)
                    .withHostConfig(HostConfig.newHostConfig()
                            .withMemory(executionProperties.getMemoryLimitBytes())
                            .withMemorySwap(executionProperties.getMemoryLimitBytes()) // No swap
                            .withCpuPeriod(executionProperties.getCpuPeriod())
                            .withCpuQuota(executionProperties.getCpuQuota())
                            .withNetworkMode("none") // No network access
                            .withSecurityOpts(java.util.List.of("no-new-privileges"))
                            .withPidsLimit(100L) // Limit processes
                            .withBinds(bind)
                    )
                    .withVolumes(new Volume("/app"))
                    .withWorkingDir("/app")
                    .withCmd(getRunCommand(language))
                    .exec();

            log.info("Container created with bind: {} -> /app", hostPath);

            containerId = container.getId();
            log.info("Created container: {}", containerId);

            // Start container
            dockerClient.startContainerCmd(containerId).exec();
            log.info("Started container: {}", containerId);

            // Wait for completion with timeout
            WaitContainerResultCallback waitCallback = new WaitContainerResultCallback();
            dockerClient.waitContainerCmd(containerId).exec(waitCallback);

            boolean completed = waitCallback.awaitCompletion(
                    executionProperties.getTimeoutMs(),
                    TimeUnit.MILLISECONDS
            );

            // Capture output
            String stdout = captureOutput(containerId, true);
            String stderr = captureOutput(containerId, false);
            log.info("Container execution completed. StdOut length: {}, StdErr length: {}",
                    stdout == null ? 0 : stdout.length(),
                    stderr == null ? 0 : stderr.length());

            long executionTime = System.currentTimeMillis() - startTime;

            if (!completed) {
                // Timeout - kill container
                try {
                    dockerClient.killContainerCmd(containerId).exec();
                } catch (Exception e) {
                    log.warn("Failed to kill container on timeout: {}", e.getMessage());
                }

                return DockerExecutionResult.builder()
                        .success(false)
                        .status("timeout")
                        .errorMessage("Execution timed out after " + executionProperties.getTimeoutMs() + "ms")
                        .executionTimeMs(executionTime)
                        .stdout(truncate(stdout, executionProperties.getMaxOutputBytes()))
                        .stderr(truncate(stderr, executionProperties.getMaxOutputBytes()))
                        .build();
            }

            Integer exitCode = waitCallback.awaitStatusCode();

            // Check for compilation errors
            String status = determineStatus(exitCode, stderr, language);

            // Log stderr for debugging compilation errors
            if (exitCode != 0) {
                log.error("Execution failed with exit code {}. Language: {}. StdErr:\n{}", exitCode, language, stderr);
            }

            return DockerExecutionResult.builder()
                    .success(exitCode == 0)
                    .status(status)
                    .exitCode(exitCode)
                    .executionTimeMs(executionTime)
                    .stdout(truncate(stdout, executionProperties.getMaxOutputBytes()))
                    .stderr(truncate(stderr, executionProperties.getMaxOutputBytes()))
                    .build();

        } catch (Exception e) {
            log.error("Docker execution failed", e);
            return DockerExecutionResult.builder()
                    .success(false)
                    .status("error")
                    .errorMessage(e.getMessage())
                    .executionTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        } finally {
            // Cleanup: remove container
            if (containerId != null) {
                try {
                    dockerClient.removeContainerCmd(containerId)
                            .withForce(true)
                            .exec();
                    log.debug("Removed container: {}", containerId);
                } catch (Exception e) {
                    log.warn("Failed to remove container {}: {}", containerId, e.getMessage());
                }
            }

            // Cleanup: remove temp directory
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                    log.debug("Removed temp directory: {}", tempDir);
                } catch (IOException e) {
                    log.warn("Failed to remove temp directory: {}", e.getMessage());
                }
            }
        }
    }

    private String getImageForLanguage(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> {
                String image = dockerProperties.getSandbox().getJava().getImage();
                yield image != null ? image : "interviewai-java-sandbox:latest";
            }
            case "python" -> {
                String image = dockerProperties.getSandbox().getPython().getImage();
                yield image != null ? image : "interviewai-python-sandbox:latest";
            }
            case "javascript", "node" -> {
                String image = dockerProperties.getSandbox().getNode().getImage();
                yield image != null ? image : "interviewai-node-sandbox:latest";
            }
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String getFileNameForLanguage(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "Solution.java";
            case "python" -> "solution.py";
            case "javascript", "node" -> "solution.js";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String[] getRunCommand(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> new String[]{"sh", "-c", "javac Solution.java && java Solution"};
            case "python" -> new String[]{"python3", "solution.py"};
            case "javascript", "node" -> new String[]{"node", "solution.js"};
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    private String captureOutput(String containerId, boolean stdout) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(stdout)
                    .withStdErr(!stdout)
                    .withFollowStream(false)
                    .exec(new ResultCallback.Adapter<Frame>() {
                        @Override
                        public void onNext(Frame frame) {
                            try {
                                outputStream.write(frame.getPayload());
                            } catch (IOException e) {
                                log.warn("Error writing log output", e);
                            }
                        }
                    })
                    .awaitCompletion(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while capturing output", e);
        }

        return outputStream.toString(StandardCharsets.UTF_8);
    }

    private String determineStatus(Integer exitCode, String stderr, String language) {
        if (exitCode == 0) {
            return "success";
        }

        String lowerStderr = stderr.toLowerCase();

        // Check for compilation errors
        if (language.equalsIgnoreCase("java") &&
            (lowerStderr.contains("error:") || lowerStderr.contains("cannot find symbol"))) {
            return "compilation_error";
        }

        if (language.equalsIgnoreCase("python") &&
            (lowerStderr.contains("syntaxerror") || lowerStderr.contains("indentationerror"))) {
            return "compilation_error";
        }

        if ((language.equalsIgnoreCase("javascript") || language.equalsIgnoreCase("node")) &&
            lowerStderr.contains("syntaxerror")) {
            return "compilation_error";
        }

        return "error";
    }

    private String truncate(String str, int maxLength) {
        if (str == null) {
            return null;
        }
        if (str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + "\n... (truncated)";
    }
}
