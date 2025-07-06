import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ContentGenerationRequest {
  masterPrompt: string;
  contentRequest: string;
  contentType: 'email' | 'blog' | 'social' | 'ad' | 'presentation' | 'proposal' | 'strategy';
  length?: 'short' | 'medium' | 'long';
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
}

export interface ContentGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    wordCount: number;
    generationTime: number;
    model: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Parse request body
    const body: ContentGenerationRequest = await request.json();
    const { masterPrompt, contentRequest, contentType, length = 'medium', tone = 'professional' } = body;

    // Validate required fields
    if (!masterPrompt || !contentRequest) {
      return NextResponse.json(
        { success: false, error: 'Master prompt and content request are required' },
        { status: 400 }
      );
    }

    // Build the full prompt with content specifications
    const lengthGuidance = {
      short: 'Keep it concise and to the point (100-200 words).',
      medium: 'Provide a good balance of detail and conciseness (200-500 words).',
      long: 'Be comprehensive and detailed (500-1000 words).'
    };

    const toneGuidance = {
      professional: 'Use a professional, business-appropriate tone.',
      casual: 'Use a casual, conversational tone that feels approachable.',
      urgent: 'Create urgency and emphasize time-sensitive benefits.',
      friendly: 'Use a warm, friendly tone that builds personal connection.'
    };

    const contentTypeInstructions = {
      email: 'Format as a professional email with subject line, greeting, body, and closing.',
      blog: 'Structure as a blog post with compelling headline, introduction, main content with subheadings, and conclusion.',
      social: 'Create engaging social media content optimized for platform engagement with hashtags if appropriate.',
      ad: 'Write compelling advertising copy with strong headline, benefits, and clear call-to-action.',
      presentation: 'Structure as presentation content with clear talking points and slide suggestions.',
      proposal: 'Format as a business proposal with executive summary, solution overview, and next steps.',
      strategy: 'Develop strategic recommendations with analysis, options, and implementation guidance.'
    };

    const fullPrompt = `${masterPrompt}

CONTENT CREATION REQUEST:
${contentRequest}

CONTENT SPECIFICATIONS:
- Type: ${contentType} - ${contentTypeInstructions[contentType]}
- Length: ${length} - ${lengthGuidance[length]}
- Tone: ${tone} - ${toneGuidance[tone]}

IMPORTANT: Create content that leverages all the business intelligence, audience psychology, and brand positioning provided in the context above. Make it highly relevant and personalized for the target audience.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });

    const generatedContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const generationTime = Date.now() - startTime;

    // Calculate word count
    const wordCount = generatedContent.split(/\s+/).filter(word => word.length > 0).length;

    return NextResponse.json({
      success: true,
      content: generatedContent,
      metadata: {
        wordCount,
        generationTime,
        model: 'claude-3-5-sonnet-20241022'
      }
    } as ContentGenerationResponse);

  } catch (error) {
    console.error('Content generation error:', error);
    
    // Handle specific API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${error.message}` 
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate content. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to generate content.' 
    },
    { status: 405 }
  );
}