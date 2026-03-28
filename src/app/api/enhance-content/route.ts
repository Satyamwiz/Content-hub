import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Core rule for all prompts: understand the user's intent and re-present it
// in a clearer, more elaborate way — stick to the original idea, don't add unrelated things.
const SYSTEM_PROMPTS: Record<string, string> = {
  "image-generation": `You are an AI prompt enhancer for image generation. Understand what the user wants to create and describe it more clearly and vividly. Stay true to their original idea — do not change the subject or add unrelated concepts. Just make the description richer and more precise. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced prompt here"}`,

  "video-generation": `You are an AI prompt enhancer for video generation. Understand the user's video concept and describe it more clearly. Keep the same core idea — just make it more detailed and specific. Do not introduce unrelated elements. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced prompt here"}`,

  "content-creation": `You are an AI content enhancer. Understand what the user wants to communicate and re-present it in a clearer, more engaging way. Stick to their original message — do not change the topic or direction. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced prompt here"}`,

  "instagram-caption": `You are an AI caption enhancer for Instagram. Understand the user's caption and re-present it in a more natural, engaging way. Keep the same core message — just make it flow better and feel more authentic. Add 3-5 relevant hashtags that match the topic. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced caption here"}`,

  "reel-script": `You are an AI script enhancer for short-form video. Understand the user's script or idea and make it clearer and punchier. Keep the same message — just improve the delivery and structure. Do not change what they want to say. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced script here"}`,

  "voiceover-script": `You are an AI voiceover script enhancer. Understand the user's script and make it flow naturally for spoken delivery. Keep the same content — just improve the pacing, clarity, and readability for narration. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced voiceover script here"}`,

  "poem": `You are an AI poetry enhancer. Understand the user's poem or idea and make it more expressive. Keep the same theme and emotion — just improve the language, imagery, and flow without changing what the poem is about. Respond ONLY with this JSON: {"enhancedPrompt": "your enhanced poem here"}`,

  "youtube-title": `You are an AI YouTube title enhancer. Understand the user's video topic and make the title clearer and more compelling. Keep the same subject — do not change what the video is about. Keep it under 70 characters. Respond ONLY with this JSON: {"enhancedTitle": "your enhanced title here", "enhancedDescription": "", "enhancedTags": ""}`,

  "youtube-description": `You are an AI YouTube description enhancer. Understand the user's description and make it clearer and better structured. Stay on the same topic — just improve readability and naturally include relevant keywords. Respond ONLY with this JSON: {"enhancedTitle": "", "enhancedDescription": "your enhanced description here", "enhancedTags": ""}`,
};

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      tags,
      videoFileName,
      context,
      promptContext,
      enhancementPrompt,
    } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (context === "enhance_prompt") {
      const systemPrompt = SYSTEM_PROMPTS[promptContext || "content-creation"];

      if (systemPrompt) {
        prompt = `${systemPrompt}\n\nUser's original content to enhance:\n"${title}"`;
      } else if (enhancementPrompt) {
        prompt = enhancementPrompt;
      } else {
        prompt = `Understand what the user is trying to say and re-present it in a clearer, more elaborate way. Stick to their original idea.\n\nOriginal: "${title}"\n\nRespond ONLY with this JSON: {"enhancedPrompt": "enhanced version here"}`;
      }
    } else if (context === "generate_from_filename") {
      prompt = `You are a YouTube content expert. Based on the video file name "${videoFileName}", generate optimized YouTube video metadata.\n\nCreate:\n1. An engaging, SEO-friendly title (max 60 characters)\n2. A compelling description (2-3 paragraphs)\n3. Relevant tags (10-15 tags, comma-separated)\n\nCurrent working title: "${title}"\n\nRespond in this exact JSON format:\n{"enhancedTitle": "title here", "enhancedDescription": "description here", "enhancedTags": "tag1, tag2, tag3"}`;
    } else {
      prompt = `You are a YouTube content optimization expert. Enhance the following video metadata while keeping the same topic and intent:\n\nCurrent Title: "${title}"\nCurrent Description: "${description}"\nCurrent Tags: "${tags}"\n${videoFileName ? `Video File: "${videoFileName}"` : ""}\n\nImprove:\n1. Title — clearer, more compelling, same topic, max 60 chars\n2. Description — better structure, same subject, natural keywords\n3. Tags — 10-15 relevant tags\n\nRespond in this exact JSON format:\n{"enhancedTitle": "title here", "enhancedDescription": "description here", "enhancedTags": "tag1, tag2, tag3"}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found in response");

      const enhancedContent = JSON.parse(jsonMatch[0]);

      if (context === "enhance_prompt") {
        const enhancedPrompt =
          enhancedContent.enhancedPrompt ||
          enhancedContent.enhancedTitle ||
          enhancedContent.enhanced_prompt ||
          enhancedContent.prompt ||
          title;

        return NextResponse.json({
          success: true,
          enhanced: {
            enhancedPrompt,
            enhancedTitle: enhancedPrompt,
          },
        });
      }

      return NextResponse.json({
        success: true,
        enhancedTitle: enhancedContent.enhancedTitle || title,
        enhancedDescription: enhancedContent.enhancedDescription || description,
        enhancedTags: enhancedContent.enhancedTags || tags,
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);

      if (context === "enhance_prompt") {
        return NextResponse.json({
          success: true,
          enhanced: {
            enhancedPrompt: text.trim() || title,
            enhancedTitle: text.trim() || title,
          },
        });
      }

      return NextResponse.json({
        success: true,
        enhancedTitle: title,
        enhancedDescription: description,
        enhancedTags: tags,
      });
    }
  } catch (error: any) {
    console.error("Content enhancement error:", error);

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Gemini API key" },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { success: false, error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to enhance content" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
