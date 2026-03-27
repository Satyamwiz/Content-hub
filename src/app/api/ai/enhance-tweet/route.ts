import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import envVars from '@/data/env/envVars';
import { auth } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY!);
const prisma = new PrismaClient();

interface EnhanceTweetRequest {
  tweetText: string;
  preferredTone: string;
  profileContext?: {
    displayName?: string;
    bio?: string;
    contentTone?: string;
    targetAudience?: string;
    primaryGoals?: string[];
    contentFocus?: string[];
  };
}

interface EnhanceTweetResponse {
  clean_version: string;
  viral_version: string;
  creative_version: string;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: EnhanceTweetRequest = await request.json();
    const { tweetText, preferredTone, profileContext } = body;

    if (!tweetText || tweetText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    if (!preferredTone || preferredTone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Preferred tone is required' },
        { status: 400 }
      );
    }

    // Get user's creator profile if not provided in request
    let profile = profileContext;
    if (!profile) {
      const userProfile = await prisma.creatorProfile.findUnique({
        where: { clerkId: userId },
        select: {
          displayName: true,
          bio: true,
          contentTone: true,
          targetAudience: true,
          primaryGoals: true,
          contentFocus: true,
        },
      });

      if (userProfile) {
        profile = {
          displayName: userProfile.displayName || undefined,
          bio: userProfile.bio || undefined,
          contentTone: userProfile.contentTone || undefined,
          targetAudience: userProfile.targetAudience || undefined,
          primaryGoals: userProfile.primaryGoals || undefined,
          contentFocus: userProfile.contentFocus || undefined,
        };
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the profile context string
    let profileContextString = '';
    if (profile) {
      const profileParts = [];
      if (profile.displayName) profileParts.push(`"displayName": "${profile.displayName}"`);
      if (profile.bio) profileParts.push(`"bio": "${profile.bio}"`);
      if (profile.contentTone) profileParts.push(`"contentTone": "${profile.contentTone}"`);
      if (profile.targetAudience) profileParts.push(`"targetAudience": "${profile.targetAudience}"`);
      if (profile.primaryGoals && profile.primaryGoals.length > 0) {
        profileParts.push(`"primaryGoals": [${profile.primaryGoals.map(g => `"${g}"`).join(', ')}]`);
      }
      if (profile.contentFocus && profile.contentFocus.length > 0) {
        profileParts.push(`"contentFocus": [${profile.contentFocus.map(f => `"${f}"`).join(', ')}]`);
      }

      if (profileParts.length > 0) {
        profileContextString = `\n\n🧾 Creator Profile (context from database)\n{\n  ${profileParts.join(',\n  ')}\n}`;
      }
    }

    const enhancementPrompt = `You are an AI Tweet Enhancer. Your task is to rewrite or improve a Tweet based on the user's input and limited creator profile context.

🎯 Primary Rule
The user's explicit preference ("how they want the tweet to sound") takes the highest priority. Use profile data only as background to maintain brand consistency, but never override user intent.

🧍 User Input
User's Draft Tweet: ${tweetText}
User's Enhancement Preference: ${preferredTone} (Examples: professional, funny, emotional, bold, sarcastic, minimalist, promotional, storytelling, etc.)${profileContextString}

🧩 Task
Enhance or rewrite the tweet to align with the user's selected tone.
Incorporate relevant style cues from the profile (like tone, focus, or goals) only if they complement the user's tone preference.
Maintain clarity, grammar, and engagement within 280 characters.
Return three improved versions:
• Clean version – safe and polished
• Viral version – catchy, platform-optimized
• Creative version – experimental and bold

⚙️ Output Format
Return ONLY a valid JSON object with this exact structure:
{
  "clean_version": "string",
  "viral_version": "string", 
  "creative_version": "string",
  "reasoning": "string (short summary of tone adaptation)"
}

Important: Return ONLY the JSON object, no additional text or formatting.`;

    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    let content = response.text().trim();

    // Clean up any markdown formatting
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const enhancedTweets: EnhanceTweetResponse = JSON.parse(content);
      
      // Validate the response structure
      if (!enhancedTweets.clean_version || !enhancedTweets.viral_version || 
          !enhancedTweets.creative_version || !enhancedTweets.reasoning) {
        throw new Error('Invalid response structure from AI');
      }

      // Ensure all versions are under 280 characters
      const truncateIfNeeded = (text: string): string => {
        return text.length > 280 ? text.substring(0, 277) + '...' : text;
      };

      enhancedTweets.clean_version = truncateIfNeeded(enhancedTweets.clean_version);
      enhancedTweets.viral_version = truncateIfNeeded(enhancedTweets.viral_version);
      enhancedTweets.creative_version = truncateIfNeeded(enhancedTweets.creative_version);

      return NextResponse.json({
        success: true,
        ...enhancedTweets
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback response if AI response can't be parsed
      return NextResponse.json({
        success: true,
        clean_version: tweetText,
        viral_version: tweetText,
        creative_version: tweetText,
        reasoning: 'AI response could not be parsed. Original tweet returned.',
        fallback: true
      });
    }

  } catch (error: any) {
    console.error('Tweet enhancement error:', error);
    
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please check your API key.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable due to quota limits. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('safety')) {
      return NextResponse.json(
        { error: 'Content filtered for safety. Please try a different approach.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enhance tweet. Please try again.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}