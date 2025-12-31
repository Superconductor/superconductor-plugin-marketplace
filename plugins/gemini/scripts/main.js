#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODELS = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];
const VIDEO_MODELS = ["veo-3.1-generate-preview", "veo-3.1-fast-generate-preview", "veo-3.0-generate-001", "veo-2.0-generate-001"];

const MIME_TYPES = {
  // Video
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  // Audio
  ".mp3": "audio/mp3",
  ".wav": "audio/wav",
  ".m4a": "audio/m4a",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  // PDF
  ".pdf": "application/pdf",
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function parseArgs(args) {
  const result = {
    model: DEFAULT_MODEL,
    file: null,
    prompt: [],
    aspectRatio: "16:9",
    duration: 8,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--model=")) {
      result.model = arg.slice("--model=".length);
    } else if (arg.startsWith("--file=")) {
      result.file = arg.slice("--file=".length);
    } else if (arg.startsWith("--aspect-ratio=")) {
      result.aspectRatio = arg.slice("--aspect-ratio=".length);
    } else if (arg.startsWith("--duration=")) {
      result.duration = parseInt(arg.slice("--duration=".length), 10);
    } else if (arg === "--model" && i + 1 < args.length) {
      result.model = args[++i];
    } else if (arg === "--file" && i + 1 < args.length) {
      result.file = args[++i];
    } else if (arg === "--aspect-ratio" && i + 1 < args.length) {
      result.aspectRatio = args[++i];
    } else if (arg === "--duration" && i + 1 < args.length) {
      result.duration = parseInt(args[++i], 10);
    } else if (!arg.startsWith("--")) {
      result.prompt.push(arg);
    }
  }

  result.prompt = result.prompt.join(" ");
  return result;
}

/**
 * Check if a URL is a valid YouTube URL and extract video ID
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
function parseYouTubeUrl(url) {
  if (!url) return null;

  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        videoId: match[1],
        // Normalize to standard watch URL format for the API
        normalizedUrl: `https://www.youtube.com/watch?v=${match[1]}`,
      };
    }
  }

  return null;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || null;
}

function isLargeFile(filePath, thresholdMB = 20) {
  const stats = fs.statSync(filePath);
  return stats.size > thresholdMB * 1024 * 1024;
}

async function uploadFile(ai, filePath, mimeType) {
  const result = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  // Wait for file to be processed
  let file = result;
  while (file.state === "PROCESSING") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    file = await ai.files.get({ name: file.name });
  }

  if (file.state === "FAILED") {
    throw new Error(`File upload failed: ${file.error?.message || "Unknown error"}`);
  }

  return file;
}

function createInlineData(filePath, mimeType) {
  const data = fs.readFileSync(filePath, { encoding: "base64" });
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
}

async function handleImageGeneration(response) {
  const parts = response.candidates?.[0]?.content?.parts || [];
  const outputs = [];

  for (const part of parts) {
    if (part.text) {
      outputs.push(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      const filename = `gemini-image-${Date.now()}.png`;
      fs.writeFileSync(filename, buffer);
      outputs.push(`Image saved as: ${filename}`);
    }
  }

  return outputs.join("\n");
}

/**
 * Generate video using Veo models
 * @param {Object} options
 * @param {string} options.prompt - The text prompt describing the video
 * @param {string} options.model - Veo model to use
 * @param {string} [options.file] - Optional starting frame image
 * @param {string} [options.aspectRatio] - "16:9" or "9:16"
 * @param {number} [options.duration] - 4, 6, or 8 seconds
 * @returns {Promise<string>} Path to saved video file
 */
export async function generateVideo(options) {
  const { prompt, model, file, aspectRatio = "16:9", duration = 8 } = options;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  if (!prompt) {
    throw new Error("No prompt provided");
  }

  const ai = new GoogleGenAI({});

  const config = {
    aspectRatio,
    durationSeconds: duration,
  };

  // Handle optional starting frame image
  let image;
  if (file) {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const mimeType = getMimeType(filePath);
    if (!mimeType || !mimeType.startsWith("image/")) {
      throw new Error(`File must be an image for video generation: ${filePath}`);
    }
    const data = fs.readFileSync(filePath, { encoding: "base64" });
    image = { imageBytes: data, mimeType };
  }

  // Start video generation
  let operation = await ai.models.generateVideos({
    model,
    prompt,
    image,
    config,
  });

  // Poll for completion
  const startTime = Date.now();
  const maxWaitMs = 10 * 60 * 1000; // 10 minutes max

  while (!operation.done) {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error("Video generation timed out after 10 minutes");
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operation = await ai.operations.get({ name: operation.name });
  }

  // Download and save the video
  const generatedVideos = operation.response?.generatedVideos || [];
  if (generatedVideos.length === 0) {
    throw new Error("No video was generated");
  }

  const video = generatedVideos[0];
  const videoUri = video.video?.uri;

  if (!videoUri) {
    throw new Error("No video URI in response");
  }

  // Fetch the video data
  const response = await fetch(videoUri);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `gemini-video-${Date.now()}.mp4`;
  fs.writeFileSync(filename, buffer);

  return `Video saved as: ${filename}`;
}

/**
 * Generate content using Gemini API
 * @param {Object} options
 * @param {string} options.prompt - The text prompt
 * @param {string} [options.model] - Model to use (default: gemini-3-flash-preview)
 * @param {string} [options.file] - Local file path or YouTube URL
 * @param {number} [options.largeFileThresholdMB] - Threshold for using Files API (default: 20)
 * @returns {Promise<string>} The generated text response
 */
export async function generateContent(options) {
  const { prompt, model = DEFAULT_MODEL, file, largeFileThresholdMB = 20 } = options;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  if (!prompt) {
    throw new Error("No prompt provided");
  }

  const ai = new GoogleGenAI({});
  const isImageModel = IMAGE_MODELS.some((m) => model.includes(m) || model.includes("-image"));

  let contents = [];

  // Handle file input (local path or YouTube URL)
  if (file) {
    const youtubeInfo = parseYouTubeUrl(file);

    if (youtubeInfo) {
      // YouTube URL - pass directly to Gemini API
      contents.push({
        fileData: {
          fileUri: youtubeInfo.normalizedUrl,
        },
      });
    } else {
      // Local file path
      const filePath = path.resolve(file);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const mimeType = getMimeType(filePath);
      if (!mimeType) {
        throw new Error(`Unsupported file type: ${path.extname(filePath)}`);
      }

      // Use Files API for large files, inline for small files
      if (isLargeFile(filePath, largeFileThresholdMB)) {
        const uploadedFile = await uploadFile(ai, filePath, mimeType);
        // Convert SDK URI format to API expected format (remove v1beta from path)
        // SDK returns: https://generativelanguage.googleapis.com/v1beta/files/<id>
        // API expects: https://generativelanguage.googleapis.com/files/<id>
        const fileUri = uploadedFile.uri.replace("/v1beta/", "/");
        contents.push({
          fileData: {
            fileUri: fileUri,
            mimeType: uploadedFile.mimeType,
          },
        });
      } else {
        contents.push(createInlineData(filePath, mimeType));
      }
    }
  }

  // Add the text prompt
  contents.push({ text: prompt });

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  // Handle image generation output
  if (isImageModel) {
    return await handleImageGeneration(response);
  } else {
    // Standard text output
    return response.text;
  }
}

async function main() {
  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "Error: GEMINI_API_KEY environment variable is not set.\n\n" +
        "To get an API key, visit: https://ai.google.dev/gemini-api/docs/api-key\n\n" +
        "Then set it in your environment:\n" +
        "  export GEMINI_API_KEY='your-api-key'",
    );
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));

  if (!args.prompt) {
    console.error(
      "Error: No prompt provided.\n\n" +
        "Usage: main.js [--model=MODEL] [--file=FILE] PROMPT\n\n" +
        "Options:\n" +
        "  --model         Model to use (default: gemini-3-flash-preview)\n" +
        "  --file          Local file path or YouTube URL\n" +
        "  --aspect-ratio  Video aspect ratio: 16:9 or 9:16 (video only)\n" +
        "  --duration      Video duration: 4, 6, or 8 seconds (video only)",
    );
    process.exit(1);
  }

  try {
    const isVideoModel = VIDEO_MODELS.some((m) => args.model.includes(m) || args.model.includes("veo"));

    let result;
    if (isVideoModel) {
      result = await generateVideo({
        prompt: args.prompt,
        model: args.model,
        file: args.file,
        aspectRatio: args.aspectRatio,
        duration: args.duration,
      });
    } else {
      result = await generateContent({
        prompt: args.prompt,
        model: args.model,
        file: args.file,
      });
    }
    console.log(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Only run main() when executed directly, not when imported
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename;
if (isMain) {
  main();
}
