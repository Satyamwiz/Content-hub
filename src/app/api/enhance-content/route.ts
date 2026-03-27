import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";

    if (context === "enhance_prompt") {
      // Handle prompt enhancement for different contexts
      prompt =
        enhancementPrompt ||
        `
You are an expert prompt engineer. Enhance this prompt to be more detailed, specific, and effective:

Original prompt: "${title}"

Provide an enhanced version that is more descriptive and will produce better results.

Please respond in this exact JSON format:
{
  "enhancedPrompt": "enhanced prompt here"
}`;
    } else if (context === "generate_from_filename") {
      // Generate content from scratch based on filename
      prompt = `
You are a YouTube content optimization expert. Based on the video file name "${videoFileName}", generate optimized YouTube video metadata.

Create:
1. An engaging, SEO-friendly title (max 60 characters)
2. A compelling description (2-3 paragraphs, include relevant keywords)
3. Relevant tags (10-15 tags, comma-separated)

Make the content engaging, searchable, and suitable for YouTube's algorithm.

Current title: "${title}"

Please respond in this exact JSON format:
{
  "enhancedTitle": "optimized title here",
  "enhancedDescription": "optimized description here",
  "enhancedTags": "tag1, tag2, tag3, etc"
}`;
    } else {
      // Enhance existing content
      prompt = `
You are a YouTube content optimization expert. Enhance the following YouTube video metadata to improve SEO, engagement, and discoverability:

Current Title: "${title}"
Current Description: "${description}"
Current Tags: "${tags}"
${videoFileName ? `Video File: "${videoFileName}"` : ""}

Please enhance:
1. Title: Make it more engaging and SEO-friendly (max 60 characters)
2. Description: Improve readability, add relevant keywords, make it more compelling (2-3 paragraphs)
3. Tags: Add relevant, searchable tags that will help with YouTube's algorithm (10-15 tags total)

Keep the core message but make it more appealing to viewers and YouTube's algorithm.

Please respond in this exact JSON format:
{
  "enhancedTitle": "enhanced title here",
  "enhancedDescription": "enhanced description here", 
  "enhancedTags": "tag1, tag2, tag3, etc"
}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response from Gemini
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const enhancedContent = JSON.parse(jsonMatch[0]);

      // Handle prompt enhancement response
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
            enhancedPrompt: enhancedPrompt,
            enhancedTitle: enhancedPrompt, // Also provide as enhancedTitle for compatibility
          },
        });
      }

      // Validate the response structure for content enhancement
      if (
        !enhancedContent.enhancedTitle ||
        !enhancedContent.enhancedDescription ||
        !enhancedContent.enhancedTags
      ) {
        throw new Error("Invalid response structure from AI");
      }

      return NextResponse.json({
        success: true,
        enhancedTitle: enhancedContent.enhancedTitle,
        enhancedDescription: enhancedContent.enhancedDescription,
        enhancedTags: enhancedContent.enhancedTags,
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);

      // Fallback: Try to extract content manually
      const lines = text.split("\n").filter((line: string) => line.trim());
      let enhancedTitle = title;
      let enhancedDescription = description;
      let enhancedTags = tags;

      // Simple fallback parsing
      for (const line of lines) {
        if (line.toLowerCase().includes("title") && line.includes(":")) {
          enhancedTitle = line
            .split(":")
            .slice(1)
            .join(":")
            .replace(/['"]/g, "")
            .trim();
        } else if (
          line.toLowerCase().includes("description") &&
          line.includes(":")
        ) {
          enhancedDescription = line
            .split(":")
            .slice(1)
            .join(":")
            .replace(/['"]/g, "")
            .trim();
        } else if (line.toLowerCase().includes("tags") && line.includes(":")) {
          enhancedTags = line
            .split(":")
            .slice(1)
            .join(":")
            .replace(/['"]/g, "")
            .trim();
        }
      }

      return NextResponse.json({
        success: true,
        enhancedTitle,
        enhancedDescription,
        enhancedTags,
      });
    }
  } catch (error: any) {
    console.error("Content enhancement error:", error);

    // Check for specific API errors
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Gemini API key" },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        {
          success: false,
          error: "API quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to enhance content" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
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
