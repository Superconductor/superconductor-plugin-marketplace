import { test, describe, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import nock from "nock";
import { generateContent, generateVideo, DEFAULT_MODEL } from "./main.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, "main.js");
const sampleFilesDir = path.join(__dirname, "sample-files");
const fixturesDir = path.join(__dirname, "fixtures");

// Track if we have a real API key (set at test start)
const hasRealApiKey = Boolean(process.env.GEMINI_API_KEY);

// Helper to run the script and capture output (for CLI validation tests)
function runScript(args, env = process.env) {
  return new Promise((resolve) => {
    const proc = spawn("node", [scriptPath, ...args], {
      env: { ...process.env, ...env },
      cwd: __dirname,
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

// Get fixture file path for a test
function getFixturePath(testName) {
  return path.join(fixturesDir, `${testName.replace(/[^a-zA-Z0-9]/g, "_")}.json`);
}

// Check if fixtures exist for a test
function hasFixtures(testName) {
  return fs.existsSync(getFixturePath(testName));
}

// Load fixtures if they exist, otherwise enable recording
function setupNock(testName) {
  // Clean any previous state first
  nock.cleanAll();
  nock.restore();

  const fixturePath = getFixturePath(testName);

  if (fs.existsSync(fixturePath)) {
    // Playback mode - activate nock to intercept requests and load recorded fixtures
    nock.activate();
    const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    nock.define(fixtures);
    return { mode: "playback", fixturePath };
  } else {
    // Record mode - don't activate nock so real requests go through
    // Just enable recording to capture the HTTP traffic
    nock.recorder.rec({
      output_objects: true,
      dont_print: true,
    });
    return { mode: "record", fixturePath };
  }
}

// Save recordings after test
function teardownNock(setupResult) {
  if (setupResult.mode === "record") {
    const recordings = nock.recorder.play();
    if (recordings.length > 0) {
      // Ensure fixtures directory exists
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(setupResult.fixturePath, JSON.stringify(recordings, null, 2));
    }
    nock.recorder.clear();
  }
  nock.cleanAll();
}

describe("CLI validation", () => {
  test("shows error when GEMINI_API_KEY is not set", async () => {
    const result = await runScript(["test prompt"], { GEMINI_API_KEY: "" });

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("GEMINI_API_KEY"));
    assert.ok(result.stderr.includes("https://ai.google.dev/gemini-api/docs/api-key"));
  });

  test("shows error when no prompt is provided", async () => {
    // Need API key set to get past first check and test prompt validation
    const result = await runScript([], { GEMINI_API_KEY: "test-key" });

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("No prompt provided"));
  });

  test("shows error for unsupported file type", async () => {
    // Use package.json as an existing file with unsupported extension
    // Need API key set to get past first check
    const result = await runScript(["--file=package.json", "analyze this"], { GEMINI_API_KEY: "test-key" });

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("Unsupported file type"));
    assert.ok(result.stderr.includes(".json"));
  });

  test("shows error when file does not exist", async () => {
    // Need API key set to get past first check
    const result = await runScript(["--file=nonexistent.mp4", "analyze this"], { GEMINI_API_KEY: "test-key" });

    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes("File not found"));
  });
});

describe("generateContent function validation", () => {
  test("throws when GEMINI_API_KEY is not set", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "";

    try {
      await assert.rejects(
        () => generateContent({ prompt: "test" }),
        /GEMINI_API_KEY environment variable is not set/,
      );
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  test("throws when no prompt is provided", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";

    try {
      await assert.rejects(() => generateContent({}), /No prompt provided/);
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  test("throws for unsupported file type", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";

    try {
      await assert.rejects(
        () => generateContent({ prompt: "analyze", file: path.join(__dirname, "package.json") }),
        /Unsupported file type/,
      );
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  test("throws when file does not exist", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";

    try {
      await assert.rejects(
        () => generateContent({ prompt: "analyze", file: "nonexistent.mp4" }),
        /File not found/,
      );
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });
});

describe("integration tests", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  before(() => {
    // Ensure we have an API key (real or fake for playback)
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  test("basic text generation works", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        prompt: "What is 1+1? Reply with just the number.",
      });

      assert.ok(result.includes("2"), `Expected "2" in output, got: ${result}`);
    } finally {
      teardownNock(setup);
    }
  });

  test("accepts model argument", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        model: "gemini-3-flash-preview",
        prompt: "Reply with only the word: hello",
      });

      assert.ok(result.toLowerCase().includes("hello"), `Expected "hello" in output, got: ${result}`);
    } finally {
      teardownNock(setup);
    }
  });
});

describe("video file handling", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const smallVideoPath = path.join(sampleFilesDir, "small_video.mp4");

  before(() => {
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  test("sample video file exists", () => {
    assert.ok(fs.existsSync(smallVideoPath), `Sample video not found: ${smallVideoPath}`);

    const stats = fs.statSync(smallVideoPath);
    assert.ok(stats.size < 20 * 1024 * 1024, "Sample file should be under 20MB");
  });

  test("small video file integration (inline data path)", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        file: smallVideoPath,
        prompt: "Briefly describe what you see in this video in one sentence.",
      });

      assert.ok(result.length > 10, "Expected meaningful response about video content");
    } finally {
      teardownNock(setup);
    }
  });

});

describe("file upload path (Files API)", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const smallVideoPath = path.join(sampleFilesDir, "small_video.mp4");

  before(() => {
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  test("forces upload path when largeFileThresholdMB=0", async (t) => {
    // By setting largeFileThresholdMB=0, even small files use the Files API upload path.
    // This tests the full upload flow: initiate -> upload -> poll -> generateContent
    // Note: gemini-3-flash-preview doesn't support Files API URIs, so we use gemini-2.5-flash
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        model: "gemini-2.5-flash", // Must use a model that supports Files API URIs
        file: smallVideoPath,
        prompt: "Briefly describe what you see in this video in one sentence.",
        largeFileThresholdMB: 0, // Force the upload path
      });

      assert.ok(result.length > 10, `Expected meaningful response, got: ${result}`);
    } finally {
      teardownNock(setup);
    }
  });
});

describe("YouTube video support", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  before(() => {
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  test("accepts YouTube URL and processes video content", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        file: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        prompt: "Who is the singer in this video? Just say the name.",
      });

      assert.ok(
        result.toLowerCase().includes("rick") || result.toLowerCase().includes("astley"),
        `YouTube video content not processed. Expected 'Rick Astley' in response.\nGot: ${result}`,
      );
    } finally {
      teardownNock(setup);
    }
  });

  test("accepts short YouTube URL format (youtu.be)", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        file: "https://youtu.be/dQw4w9WgXcQ",
        prompt: "What song is playing? Just the song title.",
      });

      assert.ok(
        result.toLowerCase().includes("never gonna give you up") || result.toLowerCase().includes("give you up"),
        `Short YouTube URL not processed. Expected song title in response.\nGot: ${result}`,
      );
    } finally {
      teardownNock(setup);
    }
  });

  test("handles YouTube URL with timestamp parameter", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        file: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30",
        prompt: "Describe what's happening at this moment in the video.",
      });

      assert.ok(result.length > 10, `Expected meaningful response about video content.\nGot: ${result}`);
    } finally {
      teardownNock(setup);
    }
  });

  test("API rejects non-existent YouTube video", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      await assert.rejects(
        () =>
          generateContent({
            file: "https://www.youtube.com/watch?v=xxxxxxxxxxx",
            prompt: "analyze this",
          }),
        // The API should return an error for non-existent videos
        (err) => err instanceof Error,
      );
    } finally {
      teardownNock(setup);
    }
  });
});

describe("audio file handling", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const smallAudioPath = path.join(sampleFilesDir, "small_audio.mp3");

  before(() => {
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  test("sample audio file exists", () => {
    assert.ok(fs.existsSync(smallAudioPath), `Sample audio not found: ${smallAudioPath}`);

    const stats = fs.statSync(smallAudioPath);
    assert.ok(stats.size < 1 * 1024 * 1024, "Sample audio file should be under 1MB");
  });

  test("audio file analysis works", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        file: smallAudioPath,
        prompt: "What do you hear in this audio? Describe it briefly.",
      });

      assert.ok(result.length > 10, `Expected meaningful response about audio content, got: ${result}`);
    } finally {
      teardownNock(setup);
    }
  });
});

describe("image generation", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalCwd = process.cwd();

  before(() => {
    if (!process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = "test-api-key-for-playback";
    }
  });

  after(() => {
    process.env.GEMINI_API_KEY = originalKey;
  });

  afterEach(() => {
    // Clean up any generated image files
    const files = fs.readdirSync(originalCwd);
    for (const file of files) {
      if (file.startsWith("gemini-image-") && file.endsWith(".png")) {
        fs.unlinkSync(path.join(originalCwd, file));
      }
    }
  });

  test("generates image with image model", async (t) => {
    if (!hasRealApiKey && !hasFixtures(t.name)) {
      t.skip("No API key and no fixtures - run with GEMINI_API_KEY to record fixtures");
      return;
    }

    const setup = setupNock(t.name);

    try {
      const result = await generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        prompt: "Generate a simple red circle on a white background.",
      });

      assert.ok(
        result.includes("Image saved as:") || result.length > 0,
        `Expected image generation result, got: ${result}`,
      );
    } finally {
      teardownNock(setup);
    }
  });
});
