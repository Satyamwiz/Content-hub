import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import envVars from '@/data/env/envVars';
import { auth } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category = 'general', userContext = '' } = body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promptSuggestionPrompt = `
You are an expert social media strategist. Generate 8 creative and engaging tweet prompt suggestions for the category: "${category}".

${userContext ? `User context: ${userContext}` : ''}

Categories and their focus:
- general: Broad appeal, trending topics, universal experiences
- business: Entrepreneurship, productivity, business insights, leadership
- tech: Technology trends, development tips, AI, innovation
- personal: Personal growth, life lessons, experiences, motivation
- entertainment: Pop culture, humor, viral content, memes
- education: Learning tips, knowledge sharing, tutorials, insights

For each suggestion, provide:
1. A clear, actionable prompt idea
2. The type of engagement it would generate
3. Why it would be effective

Format as JSON array with objects containing:
- "prompt": The actual prompt text users can use
- "engagement": Type of engagement expected (replies, shares, likes)
- "reason": Brief explanation of why it works
- "example": A sample tweet that could be generated from this prompt

Make the prompts:
- Specific enough to generate quality content
- Broad enough to allow creativity
- Trending and relevant to current social media
- Designed to maximize engagement
- Suitable for the target category

Return ONLY the JSON array, no other text.
`;

    const result = await model.generateContent(promptSuggestionPrompt);
    const response = await result.response;
    let content = response.text().trim();

    // Clean up any markdown formatting
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const suggestions = JSON.parse(content);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Invalid response format');
      }

      return NextResponse.json({
        suggestions: suggestions.slice(0, 8), // Ensure max 8 suggestions
        category
      });

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      
      // Fallback suggestions if AI response can't be parsed
      const fallbackSuggestions = [
        {
          prompt: "Share a productivity tip that changed your work routine",
          engagement: "replies, shares",
          reason: "People love actionable advice they can implement immediately",
          example: "I started time-blocking my calendar and my productivity increased 40%. Here's how: 🧵"
        },
        {
          prompt: "Ask your audience about their biggest challenge this week",
          engagement: "replies, community building",
          reason: "Questions drive engagement and create community connection",
          example: "What's your biggest challenge this week? Let's help each other out 👇"
        },
        {
          prompt: "Share a lesson you learned from a recent failure",
          engagement: "replies, shares, saves",
          reason: "Vulnerability and learning resonate strongly with audiences",
          example: "My startup failed after 2 years. Here's what I wish I knew before starting:"
        }
      ];

      return NextResponse.json({
        suggestions: fallbackSuggestions,
        category,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Prompt Suggestion Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate prompt suggestions' },
      { status: 500 }
    );
  }
}