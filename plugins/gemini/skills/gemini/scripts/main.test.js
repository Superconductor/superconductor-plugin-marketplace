import { test, describe } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, "main.js");
const sampleFilesDir = path.join(__dirname, "..", "..", "..", "..", "..", "tests", "sample-files");

// Helper to run the script and capture output
function runScript(args, env = process.env) {
  return new Promise((resolve) => {
    const proc = spawn("node", [scriptPath, ...args], {
      env: { ...process.env, ...env },
      cwd: path.join(__dirname, ".."),
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data.toString()));
    proc.stderr.on("data", (data) => (stderr += data.toString()));

    proc.on("close", (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

describe("script", () => {
  test("shows error when GEMINI_API_KEY is not set", async () => {
    const result = await runScript(["test prompt"], { GEMINI_API_KEY: "" });

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("GEMINI_API_KEY"));
    assert.ok(result.stderr.includes("https://ai.google.dev/gemini-api/docs/api-key"));
  });

  test("shows error when no prompt is provided", async () => {
    const result = await runScript([]);

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("No prompt provided"));
  });

  test("shows error for unsupported file type", async () => {
    // Use package.json as an existing file with unsupported extension
    const result = await runScript(["--file=package.json", "analyze this"]);

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("Unsupported file type"));
    assert.ok(result.stderr.includes(".json"));
  });

  test("shows error when file does not exist", async () => {
    const result = await runScript(["--file=nonexistent.mp4", "analyze this"]);

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("File not found"));
  });
});

describe("integration", () => {
  test("basic text generation works", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    const result = await runScript(["What is 1+1? Reply with just the number."]);

    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes("2"), `Expected "2" in output, got: ${result.stdout}`);
  });

  test("accepts --model argument", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    const result = await runScript(["--model=gemini-3-flash-preview", "Reply with only the word: hello"]);

    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.toLowerCase().includes("hello"), `Expected "hello" in output, got: ${result.stdout}`);
  });
});

describe("video file handling", () => {
  // Use real sample video files from tests/sample-files
  const smallVideoPath = path.join(sampleFilesDir, "small_video.mp4");
  const largeVideoPath = path.join(sampleFilesDir, "large_video.mp4");

  test("sample files exist", () => {
    assert.ok(fs.existsSync(smallVideoPath), `Small video not found: ${smallVideoPath}`);
    assert.ok(fs.existsSync(largeVideoPath), `Large video not found: ${largeVideoPath}`);

    const smallStats = fs.statSync(smallVideoPath);
    const largeStats = fs.statSync(largeVideoPath);
    assert.ok(smallStats.size < 20 * 1024 * 1024, "Small file should be under 20MB");
    assert.ok(largeStats.size > 20 * 1024 * 1024, "Large file should be over 20MB");
  });

  test("accepts small video file with supported extension", async () => {
    // Without API key, should fail at API call stage (not file validation)
    const result = await runScript([`--file=${smallVideoPath}`, "describe this video"], { GEMINI_API_KEY: "" });

    // Should fail due to missing API key, NOT due to file issues
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("GEMINI_API_KEY"), "Should fail due to missing API key, not file validation");
  });

  test("small video file integration (inline data path)", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    // Small files (<20MB) use inline base64 encoding
    const result = await runScript([
      `--file=${smallVideoPath}`,
      "Briefly describe what you see in this video in one sentence.",
    ]);

    assert.strictEqual(result.code, 0, `Failed with: ${result.stderr}`);
    assert.ok(result.stdout.length > 10, "Expected meaningful response about video content");
  });

  test("accepts large video file with supported extension", async () => {
    // Without API key, should fail at API call stage (not file validation)
    const result = await runScript([`--file=${largeVideoPath}`, "describe this video"], { GEMINI_API_KEY: "" });

    // Should fail due to missing API key, NOT due to file issues
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("GEMINI_API_KEY"), "Should fail due to missing API key, not file validation");
  });

  test("large video file integration (Files API upload path)", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    // Large files (>20MB) use the Files API upload with polling
    const result = await runScript([
      `--file=${largeVideoPath}`,
      "Briefly describe what you see in this video in one sentence.",
    ]);

    assert.strictEqual(result.code, 0, `Failed with: ${result.stderr}`);
    assert.ok(result.stdout.length > 10, "Expected meaningful response about video content");
  });
});

describe("YouTube video support", () => {
  // Tests verify that --file accepts YouTube URLs and processes them correctly

  test("accepts YouTube URL via --file and processes video content", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    // Use a well-known short video and ask a specific question about its content
    // Rick Astley - Never Gonna Give You Up
    const result = await runScript([
      "--file=https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "Who is the singer in this video? Just say the name.",
    ]);

    // The response should contain information about the video content
    assert.strictEqual(result.code, 0, `Failed with: ${result.stderr}`);
    assert.ok(
      result.stdout.toLowerCase().includes("rick") || result.stdout.toLowerCase().includes("astley"),
      `YouTube video content not processed. Expected 'Rick Astley' in response.\nGot: ${result.stdout}`,
    );
  });

  test("accepts short YouTube URL format (youtu.be)", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    const result = await runScript([
      "--file=https://youtu.be/dQw4w9WgXcQ",
      "What song is playing? Just the song title.",
    ]);

    assert.strictEqual(result.code, 0, `Failed with: ${result.stderr}`);
    assert.ok(
      result.stdout.toLowerCase().includes("never gonna give you up") ||
        result.stdout.toLowerCase().includes("give you up"),
      `Short YouTube URL not processed. Expected song title in response.\nGot: ${result.stdout}`,
    );
  });

  test("handles YouTube URL with timestamp parameter", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    const result = await runScript([
      "--file=https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30",
      "Describe what's happening at this moment in the video.",
    ]);

    // Should successfully process and return content about the video
    assert.strictEqual(result.code, 0, `Failed with: ${result.stderr}`);
    assert.ok(result.stdout.length > 10, `Expected meaningful response about video content.\nGot: ${result.stdout}`);
  });

  test("API rejects non-existent YouTube video", async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log("Skipping integration test: GEMINI_API_KEY not set");
      return;
    }

    // Valid format but non-existent video - API should reject it
    const result = await runScript(["--file=https://www.youtube.com/watch?v=xxxxxxxxxxx", "analyze this"]);

    // Should fail at API level for non-existent video
    assert.strictEqual(result.code, 1, `Expected API error for non-existent video`);
  });
});
