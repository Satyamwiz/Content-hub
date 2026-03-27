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
    const { 
      prompt, 
      tweetType = 'general',
      tone = 'professional',
      includeHashtags = true,
      includeEmojis = true,
      targetAudience = 'general',
      callToAction = false,
      generateMultiple = false
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build dynamic prompt based on user preferences
    const toneInstructions = {
      professional: 'Use a professional, authoritative tone that builds credibility',
      casual: 'Use a casual, friendly tone that feels conversational and approachable',
      humorous: 'Use humor and wit to make the content entertaining and shareable',
      inspirational: 'Use an uplifting, motivational tone that inspires action',
      educational: 'Use a clear, informative tone that teaches or explains concepts',
      personal: 'Use a personal, authentic tone that shares experiences and insights'
    };

    const tweetTypeInstructions = {
      general: 'Create a general engaging tweet',
      question: 'Create a question tweet that encourages audience engagement and replies',
      tip: 'Create a valuable tip or advice tweet that provides actionable insights',
      story: 'Create a story-based tweet that shares an experience or anecdote',
      quote: 'Create an inspirational or thought-provoking quote tweet',
      announcement: 'Create an announcement tweet that shares news or updates',
      thread: 'Create the first tweet of a potential thread with a hook',
      poll: 'Create a poll-style tweet that encourages voting and engagement'
    };

    const audienceInstructions = {
      general: 'Appeal to a broad, general audience',
      entrepreneurs: 'Target entrepreneurs, startup founders, and business owners',
      developers: 'Target software developers, programmers, and tech professionals',
      marketers: 'Target marketing professionals and digital marketers',
      creators: 'Target content creators, influencers, and creative professionals',
      students: 'Target students, learners, and educational community'
    };

    const enhancedPrompt = `
You are an expert social media strategist and content creator specializing in Twitter/X. Your goal is to create highly engaging, viral-worthy content that drives meaningful engagement.

CONTENT REQUEST: "${prompt}"

SPECIFICATIONS:
- Tweet Type: ${tweetTypeInstructions[tweetType as keyof typeof tweetTypeInstructions]}
- Tone: ${toneInstructions[tone as keyof typeof toneInstructions]}
- Target Audience: ${audienceInstructions[targetAudience as keyof typeof audienceInstructions]}
- Include Hashtags: ${includeHashtags ? 'Yes (2-3 relevant hashtags max)' : 'No hashtags'}
- Include Emojis: ${includeEmojis ? 'Yes (use strategically, 1-3 emojis)' : 'No emojis'}
- Call to Action: ${callToAction ? 'Include a clear call to action' : 'No specific call to action needed'}

OPTIMIZATION GUIDELINES:
✅ Character Limit: Stay under 280 characters (aim for 240-260 for optimal engagement)
✅ Engagement: Use psychological triggers (curiosity, emotion, value, relatability)
✅ Readability: Use line breaks, spacing, and formatting for easy scanning
✅ Timing: Consider current trends and viral formats
✅ Authenticity: Make it sound human and genuine, not robotic
✅ Value: Provide clear value (entertainment, education, inspiration, or insight)

ENGAGEMENT BOOSTERS:
- Start with a hook that grabs attention in the first 5 words
- Use power words that evoke emotion
- Include numbers or statistics when relevant
- Ask questions to encourage replies
- Use contrarian or surprising angles
- Reference current events or trends when appropriate
- Create urgency or scarcity when fitting

AVOID:
❌ Generic, boring content
❌ Overly promotional language
❌ Controversial or divisive topics
❌ Spam-like behavior
❌ Overuse of hashtags or emojis
❌ Complex jargon or technical terms (unless targeting developers)

${generateMultiple ? 
  'Generate 3 different tweet variations with different approaches (hook, angle, or style). Format as JSON array with "tweet" and "approach" fields.' :
  'Return ONLY the tweet text, nothing else. No quotes, no explanations, just the tweet content ready to post.'
}
`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    let content = response.text().trim();

    if (generateMultiple) {
      try {
        // Try to parse as JSON for multiple tweets
        const tweets = JSON.parse(content);
        if (Array.isArray(tweets)) {
          return NextResponse.json({
            tweets: tweets.map((t: any) => ({
              tweet: t.tweet.length <= 280 ? t.tweet : t.tweet.substring(0, 277) + '...',
              approach: t.approach,
              length: t.tweet.length
            })),
            multiple: true
          });
        }
      } catch {
        // If JSON parsing fails, treat as single tweet
      }
    }

    // Handle single tweet
    let tweet = content;
    
    // Clean up any quotes or formatting
    tweet = tweet.replace(/^["']|["']$/g, '').trim();

    // Ensure tweet is under 280 characters
    if (tweet.length > 280) {
      const shortenPrompt = `
Shorten this tweet to under 280 characters while maintaining its impact and engagement:
"${tweet}"

Keep the same tone (${tone}) and style. Preserve the most important elements.
Return ONLY the shortened tweet, nothing else.
`;
      
      const shortenResult = await model.generateContent(shortenPrompt);
      const shortenResponse = await shortenResult.response;
      const shortenedTweet = shortenResponse.text().replace(/^["']|["']$/g, '').trim();
      
      return NextResponse.json({
        tweet: shortenedTweet.length <= 280 ? shortenedTweet : tweet.substring(0, 277) + '...',
        originalLength: tweet.length,
        shortened: true,
        multiple: false
      });
    }

    return NextResponse.json({
      tweet,
      originalLength: tweet.length,
      shortened: false,
      multiple: false
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please check your API key.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable due to quota limits. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('safety')) {
        return NextResponse.json(
          { error: 'Content filtered for safety. Please try a different prompt.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate tweet. Please try again.' },
      { status: 500 }
    );
  }
}