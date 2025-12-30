#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODELS = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];

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
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--model=")) {
      result.model = arg.slice("--model=".length);
    } else if (arg.startsWith("--file=")) {
      result.file = arg.slice("--file=".length);
    } else if (arg === "--model" && i + 1 < args.length) {
      result.model = args[++i];
    } else if (arg === "--file" && i + 1 < args.length) {
      result.file = args[++i];
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
        "  --model  Model to use (default: gemini-3-flash-preview)\n" +
        "  --file   Local file path or YouTube URL",
    );
    process.exit(1);
  }

  const ai = new GoogleGenAI({});
  const isImageModel = IMAGE_MODELS.some((m) => args.model.includes(m) || args.model.includes("-image"));

  let contents = [];

  // Handle file input (local path or YouTube URL)
  if (args.file) {
    const youtubeInfo = parseYouTubeUrl(args.file);

    if (youtubeInfo) {
      // YouTube URL - pass directly to Gemini API
      contents.push({
        fileData: {
          fileUri: youtubeInfo.normalizedUrl,
        },
      });
    } else {
      // Local file path
      const filePath = path.resolve(args.file);

      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }

      const mimeType = getMimeType(filePath);
      if (!mimeType) {
        console.error(
          `Error: Unsupported file type: ${path.extname(filePath)}\n\n` +
            `Supported types: ${Object.keys(MIME_TYPES).join(", ")}`,
        );
        process.exit(1);
      }

      // Use Files API for large files, inline for small files
      if (isLargeFile(filePath)) {
        const file = await uploadFile(ai, filePath, mimeType);
        contents.push({
          fileData: {
            fileUri: file.uri,
            mimeType: file.mimeType,
          },
        });
      } else {
        contents.push(createInlineData(filePath, mimeType));
      }
    }
  }

  // Add the text prompt
  contents.push({ text: args.prompt });

  try {
    const response = await ai.models.generateContent({
      model: args.model,
      contents,
    });

    // Handle image generation output
    if (isImageModel) {
      const output = await handleImageGeneration(response);
      console.log(output);
    } else {
      // Standard text output
      console.log(response.text);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
