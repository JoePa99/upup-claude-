import { ContentGenerationRequest, ContentGenerationResponse } from '@/app/api/generate-content/route';

export interface GenerateContentOptions {
  masterPrompt: string;
  contentRequest: string;
  contentType: 'email' | 'blog' | 'social' | 'ad' | 'presentation' | 'proposal' | 'strategy';
  length?: 'short' | 'medium' | 'long';
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
}

export interface ContentResult {
  content: string;
  metadata: {
    wordCount: number;
    generationTime: number;
    model: string;
  };
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate content using the AI API
   */
  async generateContent(options: GenerateContentOptions): Promise<ContentResult> {
    try {
      const requestBody: ContentGenerationRequest = {
        masterPrompt: options.masterPrompt,
        contentRequest: options.contentRequest,
        contentType: options.contentType,
        length: options.length || 'medium',
        tone: options.tone || 'professional'
      };

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ContentGenerationResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Content generation failed');
      }

      if (!data.content || !data.metadata) {
        throw new Error('Invalid response from content generation API');
      }

      return {
        content: data.content,
        metadata: data.metadata
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error occurred during content generation');
    }
  }

  /**
   * Get content type suggestions based on the context
   */
  getContentTypeSuggestions(segment: string, journeyStage: string): Array<{
    type: GenerateContentOptions['contentType'];
    label: string;
    description: string;
    recommended: boolean;
  }> {
    const suggestions = [
      {
        type: 'email' as const,
        label: 'Marketing Email',
        description: 'Personalized email outreach',
        recommended: journeyStage === 'awareness' || journeyStage === 'evaluation'
      },
      {
        type: 'blog' as const,
        label: 'Blog Post',
        description: 'Educational content for thought leadership',
        recommended: journeyStage === 'awareness'
      },
      {
        type: 'social' as const,
        label: 'Social Media',
        description: 'Engaging social media content',
        recommended: journeyStage === 'awareness'
      },
      {
        type: 'ad' as const,
        label: 'Advertisement',
        description: 'Compelling ad copy for paid campaigns',
        recommended: journeyStage === 'awareness'
      },
      {
        type: 'presentation' as const,
        label: 'Presentation',
        description: 'Pitch deck or presentation content',
        recommended: journeyStage === 'evaluation'
      },
      {
        type: 'proposal' as const,
        label: 'Business Proposal',
        description: 'Formal business proposal or offer',
        recommended: journeyStage === 'evaluation' || journeyStage === 'partnership'
      },
      {
        type: 'strategy' as const,
        label: 'Strategic Content',
        description: 'Strategic analysis and recommendations',
        recommended: journeyStage === 'partnership' || journeyStage === 'growth'
      }
    ];

    return suggestions.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return 0;
    });
  }

  /**
   * Get tone suggestions based on segment and situation
   */
  getToneSuggestions(segment: string, urgencyLevel: string): Array<{
    tone: GenerateContentOptions['tone'];
    label: string;
    description: string;
    recommended: boolean;
  }> {
    const suggestions = [
      {
        tone: 'professional' as const,
        label: 'Professional',
        description: 'Business-appropriate and authoritative',
        recommended: segment.includes('sponsor') || segment.includes('founder')
      },
      {
        tone: 'friendly' as const,
        label: 'Friendly',
        description: 'Warm and approachable',
        recommended: segment.includes('family') || segment.includes('first_time')
      },
      {
        tone: 'urgent' as const,
        label: 'Urgent',
        description: 'Time-sensitive and action-oriented',
        recommended: urgencyLevel === 'high'
      },
      {
        tone: 'casual' as const,
        label: 'Casual',
        description: 'Conversational and relaxed',
        recommended: segment.includes('technology')
      }
    ];

    return suggestions.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return 0;
    });
  }

  /**
   * Get length suggestions based on content type
   */
  getLengthSuggestions(contentType: GenerateContentOptions['contentType']): Array<{
    length: GenerateContentOptions['length'];
    label: string;
    description: string;
    recommended: boolean;
  }> {
    const suggestions = [
      {
        length: 'short' as const,
        label: 'Short',
        description: '100-200 words',
        recommended: contentType === 'social' || contentType === 'ad'
      },
      {
        length: 'medium' as const,
        label: 'Medium',
        description: '200-500 words',
        recommended: contentType === 'email' || contentType === 'presentation'
      },
      {
        length: 'long' as const,
        label: 'Long',
        description: '500-1000 words',
        recommended: contentType === 'blog' || contentType === 'proposal' || contentType === 'strategy'
      }
    ];

    return suggestions.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return 0;
    });
  }

  /**
   * Validate content generation options
   */
  validateOptions(options: GenerateContentOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.masterPrompt?.trim()) {
      errors.push('Master prompt is required');
    }

    if (!options.contentRequest?.trim()) {
      errors.push('Content request is required');
    }

    if (options.contentRequest && options.contentRequest.length < 10) {
      errors.push('Content request should be at least 10 characters');
    }

    if (options.contentRequest && options.contentRequest.length > 500) {
      errors.push('Content request should be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();