import { 
  ContextFormData, 
  GeneratedContext, 
  ContextMetadata, 
  QualityMetrics, 
  OptimizationSuggestion,
  OntologyData,
  CustomerSegment,
  ChannelRecommendation,
  MessageFramework,
  RuleCondition
} from '@/types/ontology';
import ontologyData from '@/data/ontology.json';

export class ContextEngine {
  private ontology: OntologyData;

  constructor() {
    this.ontology = ontologyData as OntologyData;
  }

  /**
   * Generate comprehensive context from form data
   */
  generateContext(formData: ContextFormData): GeneratedContext {
    // Step 1: Load customer segment profile
    const segment = this.getCustomerSegment(formData.segment);
    if (!segment) {
      throw new Error(`Invalid customer segment: ${formData.segment}`);
    }

    // Step 2: Calculate voice weights based on segment, pain points, and situation
    const voiceWeights = this.calculateVoiceWeights(formData, segment);

    // Step 3: Determine message framework and priorities
    const messageFramework = this.selectMessageFramework(formData, voiceWeights);

    // Step 4: Generate channel recommendations
    const channelRecommendations = this.generateChannelRecommendations(formData);

    // Step 5: Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(formData);

    // Step 6: Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(formData, qualityMetrics);

    // Step 7: Build context metadata
    const metadata: ContextMetadata = {
      voiceWeights,
      messageFramework: messageFramework.name,
      channelRecommendations,
      confidenceScores: this.calculateConfidenceScores(formData),
      competitiveDifferentiation: this.getCompetitiveDifferentiation(formData)
    };

    // Step 8: Generate prompts
    const systemPrompt = this.buildSystemPrompt(formData, segment, voiceWeights);
    const contextPrompt = this.buildContextPrompt(formData, segment, metadata);
    const taskPrompt = this.buildTaskPrompt(formData, messageFramework);

    return {
      systemPrompt,
      contextPrompt,
      taskPrompt,
      metadata,
      qualityScore: qualityMetrics.overallScore,
      suggestions
    };
  }

  /**
   * Calculate voice attribute weights based on segment preferences and situational modifiers
   */
  private calculateVoiceWeights(formData: ContextFormData, segment: CustomerSegment): Record<string, number> {
    const weights: Record<string, number> = {};
    
    // Get base voice preferences for segment
    const voicePreference = segment.voicePreferences[0];
    if (!voicePreference) {
      // Default voice weights if no preferences defined
      return { trustworthy: 0.5, empathetic: 0.3, experienced: 0.2 };
    }

    // Set base weights
    weights[voicePreference.primary] = 0.6;
    weights[voicePreference.secondary] = 0.4;

    // Apply situational modifiers
    voicePreference.situationalModifiers.forEach(modifier => {
      if (this.matchesCondition(modifier.condition, formData)) {
        const [voice, adjustment] = modifier.voiceAdjustment.split('_');
        const adjustmentValue = parseFloat(adjustment) || 0;
        weights[voice] = (weights[voice] || 0) + adjustmentValue;
      }
    });

    // Apply relationship rules
    this.ontology.relationshipRules.forEach(rule => {
      if (this.matchesRuleCondition(rule.condition, formData)) {
        Object.entries(rule.effect.voiceAdjustment || {}).forEach(([voice, adjustment]) => {
          weights[voice] = (weights[voice] || 0) + adjustment;
        });
      }
    });

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(weights).forEach(voice => {
        weights[voice] = weights[voice] / totalWeight;
      });
    }

    return weights;
  }

  /**
   * Select appropriate message framework based on pain points and voice
   */
  private selectMessageFramework(formData: ContextFormData, voiceWeights: Record<string, number>) {
    const primaryPainPoint = formData.painPointPriorities?.[0]?.painPointId || 'general';
    const primaryVoice = Object.entries(voiceWeights).reduce((a, b) => 
      voiceWeights[a[0]] > voiceWeights[b[0]] ? a : b
    )[0];

    // Find matching message framework or create default
    const messageFramework = this.ontology.messageFrameworks?.find(mf => 
      mf.painPointId === primaryPainPoint && mf.voiceAttributes.includes(primaryVoice)
    );

    if (messageFramework) {
      return messageFramework;
    }

    // Default message framework
    return {
      id: 'default',
      name: 'Default Framework',
      painPointId: primaryPainPoint,
      voiceAttributes: [primaryVoice],
      structure: {
        hook: 'acknowledge_situation_with_credibility',
        body: 'solution_explanation_with_proof_points',
        close: 'clear_next_step_with_certainty'
      },
      templates: {
        hookOptions: ['We understand your situation', 'You\'re facing a common challenge'],
        bodyFramework: 'Here\'s how we can help: [SOLUTION] with [PROOF_POINTS]',
        closeOptions: ['Let\'s discuss your specific needs', 'Here\'s what we recommend']
      },
      proofPointPriorities: ['track_record', 'testimonials', 'case_studies']
    };
  }

  /**
   * Generate channel recommendations based on segment preferences and journey stage
   */
  private generateChannelRecommendations(formData: ContextFormData): ChannelRecommendation[] {
    const journeyStage = this.ontology.journeyStages.find(js => js.id === formData.journeyStage);
    const urgencyMultiplier = formData.urgencyLevel === 'high' ? 1.2 : formData.urgencyLevel === 'low' ? 0.8 : 1.0;

    const recommendations: ChannelRecommendation[] = [];

    // Get preferred channels for the journey stage
    const preferredChannels = journeyStage?.preferredChannels || ['email', 'phone', 'linkedin'];

    preferredChannels.forEach((channel, index) => {
      const baseEffectiveness = 1.0 - (index * 0.1); // Decreasing effectiveness by order
      const effectiveness = Math.min(1.0, baseEffectiveness * urgencyMultiplier);

      recommendations.push({
        channel,
        effectiveness,
        timing: this.getOptimalTiming(channel, formData.urgencyLevel),
        format: this.getOptimalFormat(channel),
        reasoning: this.getChannelReasoning(channel, formData.journeyStage, formData.urgencyLevel)
      });
    });

    return recommendations.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Calculate quality metrics for the context
   */
  private calculateQualityMetrics(formData: ContextFormData): QualityMetrics {
    const completenessScore = this.calculateCompletenessScore(formData);
    const specificityScore = this.calculateSpecificityScore(formData);
    const differentiationScore = this.calculateDifferentiationScore(formData);
    const voiceAlignmentScore = this.calculateVoiceAlignmentScore(formData);

    const overallScore = (
      completenessScore * 0.3 +
      specificityScore * 0.25 +
      differentiationScore * 0.25 +
      voiceAlignmentScore * 0.2
    );

    return {
      completenessScore,
      specificityScore,
      differentiationScore,
      voiceAlignmentScore,
      overallScore
    };
  }

  /**
   * Generate optimization suggestions based on quality metrics
   */
  private generateOptimizationSuggestions(formData: ContextFormData, qualityMetrics: QualityMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (qualityMetrics.completenessScore < 0.7) {
      suggestions.push({
        type: 'completeness',
        title: 'Add More Context Details',
        description: 'Adding competitive context and specific objectives will improve context quality',
        impact: 'medium',
        actionable: true,
        fieldToImprove: 'competitiveContext'
      });
    }

    if (qualityMetrics.specificityScore < 0.6) {
      suggestions.push({
        type: 'specificity',
        title: 'Increase Personalization',
        description: 'Add company-specific details and custom pain points for better personalization',
        impact: 'high',
        actionable: true,
        fieldToImprove: 'customPainPoints'
      });
    }

    if (qualityMetrics.differentiationScore < 0.5) {
      suggestions.push({
        type: 'differentiation',
        title: 'Strengthen Competitive Position',
        description: 'Define competitive alternatives to improve message differentiation',
        impact: 'high',
        actionable: true,
        fieldToImprove: 'competitiveContext'
      });
    }

    return suggestions;
  }

  /**
   * Build system prompt that defines AI personality and expertise
   */
  private buildSystemPrompt(formData: ContextFormData, segment: CustomerSegment, voiceWeights: Record<string, number>): string {
    const primaryVoice = Object.entries(voiceWeights).reduce((a, b) => 
      voiceWeights[a[0]] > voiceWeights[b[0]] ? a : b
    )[0];
    
    const secondaryVoice = Object.entries(voiceWeights)
      .filter(([voice]) => voice !== primaryVoice)
      .reduce((a, b) => voiceWeights[a[0]] > voiceWeights[b[0]] ? a : b)[0];

    const primaryVoiceAttr = this.ontology.voiceAttributes.find(va => va.id === primaryVoice);
    const secondaryVoiceAttr = this.ontology.voiceAttributes.find(va => va.id === secondaryVoice);

    return `You are a ${primaryVoiceAttr?.name.toLowerCase()} and ${secondaryVoiceAttr?.name.toLowerCase()} business advisor specializing in growth capital for ${segment.name.toLowerCase()} companies. You have deep expertise in business strategy, competitive positioning, and effective communication.

Communication Style: ${primaryVoiceAttr?.communicationStyle}. ${primaryVoiceAttr?.description}.

Always: ${primaryVoiceAttr?.do.join(', ')}
Never: ${primaryVoiceAttr?.dont.join(', ')}

Use phrases like: ${primaryVoiceAttr?.keyPhrases.join(', ')}`;
  }

  /**
   * Build context prompt with specific situational intelligence
   */
  private buildContextPrompt(formData: ContextFormData, segment: CustomerSegment, metadata: ContextMetadata): string {
    const primaryPainPoint = formData.painPointPriorities?.[0]?.painPointId;
    const painPoint = this.ontology.painPoints.find(pp => pp.id === primaryPainPoint);
    const journeyStage = this.ontology.journeyStages.find(js => js.id === formData.journeyStage);

    let contextPrompt = `You are speaking with a ${segment.name.toLowerCase()} who is in the ${journeyStage?.name.toLowerCase()} stage`;
    
    if (painPoint) {
      contextPrompt += ` and primarily concerned about ${painPoint.name.toLowerCase()}.`;
    }

    contextPrompt += `\n\nTheir key motivations are: ${segment.psychographics.primaryMotivations.join(', ')}.`;
    contextPrompt += `\nThey fear: ${segment.psychographics.coreFears.join(', ')}.`;
    contextPrompt += `\nThey value: ${segment.psychographics.valuesHierarchy.join(', ')}.`;

    if (formData.competitiveContext) {
      contextPrompt += `\n\nCompetitive Context: They are also considering alternatives. Our key differentiators are: ${metadata.competitiveDifferentiation.join(', ')}.`;
    }

    contextPrompt += `\n\nThis is a ${formData.relationshipStage?.replace('_', ' ')} interaction with ${formData.urgencyLevel} urgency.`;

    return contextPrompt;
  }

  /**
   * Build task-specific prompt with output requirements
   */
  private buildTaskPrompt(formData: ContextFormData, messageFramework: MessageFramework): string {
    const outputInstructions = this.getOutputInstructions(formData.outputType);
    const lengthGuidance = formData.lengthRequirement ? `Keep to ${formData.lengthRequirement}.` : '';

    return `Create a ${formData.outputType} that follows this structure:
${messageFramework.structure.hook} + ${messageFramework.structure.body} + ${messageFramework.structure.close}

${outputInstructions}
${lengthGuidance}

Include specific proof points and personalize based on the context provided.`;
  }

  /**
   * Helper methods
   */
  private getCustomerSegment(segmentId: string): CustomerSegment | undefined {
    return this.ontology.customerSegments.find(cs => cs.id === segmentId);
  }

  private matchesCondition(condition: string, formData: ContextFormData): boolean {
    switch (condition) {
      case 'first_interaction':
        return formData.relationshipStage === 'first_interaction';
      case 'competitive_situation':
        return Boolean(formData.competitiveContext);
      case 'family_business':
        return formData.companyProfile?.culture?.values?.includes('family') || false;
      default:
        return false;
    }
  }

  private matchesRuleCondition(condition: RuleCondition, formData: ContextFormData): boolean {
    if (condition.segment && condition.segment !== formData.segment) return false;
    if (condition.painPoint && !formData.painPointPriorities?.some(pp => pp.painPointId === condition.painPoint)) return false;
    if (condition.journeyStage && condition.journeyStage !== formData.journeyStage) return false;
    if (condition.competitiveContext && !formData.competitiveContext) return false;
    return true;
  }

  private calculateCompletenessScore(formData: ContextFormData): number {
    const requiredFields = ['segment', 'journeyStage', 'painPointPriorities', 'outputType'];
    const optionalFields = ['competitiveContext', 'companyProfile', 'strategicObjectives'];
    
    const requiredComplete = requiredFields.filter(field => {
      const value = formData[field as keyof ContextFormData];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    const optionalComplete = optionalFields.filter(field => {
      const value = formData[field as keyof ContextFormData];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;

    return (requiredComplete / requiredFields.length) * 0.7 + (optionalComplete / optionalFields.length) * 0.3;
  }

  private calculateSpecificityScore(formData: ContextFormData): number {
    let score = 0.3; // Base score
    
    if (formData.customPainPoints?.length) score += 0.2;
    if (formData.companyProfile) score += 0.2;
    if (formData.strategicObjectives?.length) score += 0.15;
    if (formData.specificRequirements?.length) score += 0.15;
    
    return Math.min(1.0, score);
  }

  private calculateDifferentiationScore(formData: ContextFormData): number {
    if (!formData.competitiveContext) return 0.2;
    
    let score = 0.5; // Base score for having competitive context
    
    if (formData.competitiveContext.competitors?.length) score += 0.3;
    if (formData.competitiveContext.differentiators?.length) score += 0.2;
    
    return Math.min(1.0, score);
  }

  private calculateVoiceAlignmentScore(formData: ContextFormData): number {
    // This would analyze consistency between voice selection and situation
    // For now, return a reasonable score based on segment alignment
    const segment = this.getCustomerSegment(formData.segment);
    return segment ? 0.8 : 0.5;
  }

  private calculateConfidenceScores(formData: ContextFormData): Record<string, number> {
    return {
      segment_match: formData.segment ? 0.9 : 0.3,
      pain_point_relevance: formData.painPointPriorities?.length ? 0.8 : 0.4,
      journey_stage_accuracy: formData.journeyStage ? 0.85 : 0.4,
      competitive_context: formData.competitiveContext ? 0.7 : 0.3
    };
  }

  private getCompetitiveDifferentiation(formData: ContextFormData): string[] {
    return formData.competitiveContext?.differentiators || [
      'integrated_platform',
      'relationship_focus',
      'industry_expertise'
    ];
  }

  private getOptimalTiming(channel: string, urgencyLevel: string): string {
    const timingMap: Record<string, Record<string, string>> = {
      'email': {
        'low': 'within_24_hours',
        'medium': 'within_12_hours',
        'high': 'within_4_hours'
      },
      'phone': {
        'low': 'within_48_hours',
        'medium': 'within_24_hours',
        'high': 'within_2_hours'
      },
      'linkedin': {
        'low': 'within_48_hours',
        'medium': 'within_24_hours',
        'high': 'within_8_hours'
      }
    };

    return timingMap[channel]?.[urgencyLevel] || 'within_24_hours';
  }

  private getOptimalFormat(channel: string): string {
    if (channel === 'email') return 'personalized_email';
    if (channel === 'phone') return 'conversation_guide';
    if (channel === 'linkedin') return 'professional_message';
    return 'standard_format';
  }

  private getChannelReasoning(channel: string, journeyStage: string, urgencyLevel: string): string {
    return `${channel} is effective for ${journeyStage} stage with ${urgencyLevel} urgency based on customer preferences and response patterns`;
  }

  private getOutputInstructions(outputType: string): string {
    const instructions: Record<string, string> = {
      'email': 'Create a professional email with clear subject line, personalized greeting, and compelling call-to-action.',
      'presentation': 'Structure as a presentation flow with key messages, supporting points, and audience engagement.',
      'proposal': 'Format as a business proposal with executive summary, solution overview, and next steps.',
      'strategy': 'Develop strategic recommendations with analysis, options, and implementation guidance.',
      'content': 'Create engaging content that educates and persuades the target audience.'
    };

    return instructions[outputType] || 'Create clear, professional content that addresses the audience\'s needs.';
  }
}

// Export singleton instance
export const contextEngine = new ContextEngine();