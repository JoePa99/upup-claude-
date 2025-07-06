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
  RuleCondition,
  JourneyStage,
  Psychographics
} from '@/types/ontology';
import ontologyData from '@/data/ontology.json';

export class ContextEngine {
  private ontology: OntologyData;

  constructor() {
    this.ontology = ontologyData as unknown as OntologyData;
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

    // Step 8: Generate master prompt
    const masterPrompt = this.buildMasterPrompt(formData, segment, voiceWeights, messageFramework, metadata);

    return {
      systemPrompt: masterPrompt,
      contextPrompt: '', // Legacy compatibility
      taskPrompt: '', // Legacy compatibility
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
    this.ontology.relationshipRules?.forEach(rule => {
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
   * Build comprehensive master prompt that incorporates all enterprise business intelligence
   */
  private buildMasterPrompt(
    formData: ContextFormData, 
    segment: CustomerSegment, 
    voiceWeights: Record<string, number>,
    messageFramework: MessageFramework,
    metadata: ContextMetadata
  ): string {
    const journeyStage = this.ontology.journeyStages.find(js => js.id === formData.journeyStage);
    const primaryVoice = Object.entries(voiceWeights).reduce((a, b) => 
      voiceWeights[a[0]] > voiceWeights[b[0]] ? a : b
    )[0];
    const primaryVoiceAttr = this.ontology.voiceAttributes.find(va => va.id === primaryVoice);

    // Get ranked pain points
    const rankedPainPoints = formData.painPointPriorities
      .sort((a, b) => a.priority - b.priority)
      .map(pp => {
        const painPoint = this.ontology.painPoints.find(p => p.id === pp.painPointId);
        return painPoint ? `(${pp.priority}) ${painPoint.name} - ${painPoint.description}` : '';
      })
      .filter(Boolean);

    // Apply cultural and regional modifiers
    const culturalContext = this.applyCulturalModifiers(formData, segment);
    const stakeholderContext = this.getStakeholderContext();
    const competitiveIntelligence = this.getCompetitiveIntelligence();
    const behavioralTriggers = this.getBehavioralTriggersContext(segment);

    const masterPrompt = `You are creating content for ${segment.name}s representing ${this.ontology.foundation?.companyProfile?.name || 'Plexus Capital'} - ${this.ontology.foundation?.companyProfile?.missionStatement || 'a strategic capital partner'}.

COMPANY CONTEXT & BRAND PERSONALITY:
Brand Archetype: ${this.ontology.foundation?.brandPersonality?.archetype || 'trusted_advisor_and_catalyst'}
Brand Promise: ${this.ontology.foundation?.brandPersonality?.brandPromise || 'We deliver certainty in uncertain markets through proven expertise and unwavering partnership'}
Core Values: ${this.ontology.foundation?.companyProfile?.coreValues?.join(', ') || 'partnership_over_transaction, operational_excellence, long_term_value_creation'}

VALUE PROPOSITION & COMPETITIVE POSITIONING:
Primary Value Prop: ${this.ontology.foundation?.businessModel?.valueProposition?.primary || 'integrated_capital_platform'}
Key Differentiators: ${this.ontology.foundation?.businessModel?.valueProposition?.differentiators?.join(', ') || 'speed_of_execution, operational_value_add, flexible_capital_solutions'}
Competitive Advantages: ${this.ontology.foundation?.businessModel?.valueProposition?.competitiveAdvantages?.join(', ') || 'proprietary_sponsor_network, proven_value_creation_playbook'}

TARGET AUDIENCE PROFILE:
Segment: ${segment.name} - ${segment.description.toLowerCase()}
${journeyStage ? `Current Stage: ${journeyStage.name} - ${journeyStage.description}` : ''}
Sub-segment Focus: ${this.getSubSegmentContext(formData.segment)}
${this.getBrandPersonalityAlignment(segment)}

Demographics & Firmographics:
- Age: ${segment.demographics.ageRange}
- Education: ${segment.demographics.education}
- Income: ${segment.demographics.income}
- Company Size: ${segment.demographics.companySize || 'Not specified'}
- Geographic Distribution: ${this.getGeographicContext(segment)}

DEEP AUDIENCE PSYCHOLOGY:
Primary Pain Points (prioritized):
${rankedPainPoints.map(pp => `• ${pp}`).join('\n')}

Motivational Drivers: ${segment.psychographics.primaryMotivations.join(', ')}
Core Fears & Anxieties: ${segment.psychographics.coreFears.join(', ')}
Values Hierarchy: ${segment.psychographics.valuesHierarchy.join(', ')}
Decision Making Style: ${segment.psychographics.decisionMaking || 'Not specified'}
${behavioralTriggers}
${culturalContext}

STAKEHOLDER ECOSYSTEM AWARENESS:
${stakeholderContext}

COMMUNICATION STRATEGY:
Voice & Tone: ${primaryVoiceAttr?.name} (${Math.round((voiceWeights[primaryVoice] || 0) * 100)}%) - ${primaryVoiceAttr?.description}
Communication Style: ${primaryVoiceAttr?.communicationStyle}
Emotional Benefits to Deliver: ${this.ontology.foundation?.brandPersonality?.emotionalBenefits?.join(', ') || 'confidence_in_partnership, reduced_execution_anxiety'}

Message Architecture:
- Hook Strategy: ${messageFramework.structure.hook}
- Body Framework: ${messageFramework.structure.body}  
- Close Approach: ${messageFramework.structure.close}

Proof Point Hierarchy: ${messageFramework.proofPointPriorities.join(' > ')}
Key Phrases to Integrate: ${primaryVoiceAttr?.keyPhrases.join(', ')}

COMMUNICATION GUIDELINES:
✅ ALWAYS DO: ${primaryVoiceAttr?.do.join(', ')}
❌ NEVER DO: ${primaryVoiceAttr?.dont.join(', ')}

SITUATIONAL CONTEXT:
Relationship Stage: ${formData.relationshipStage?.replace('_', ' ')} 
Urgency Level: ${formData.urgencyLevel}
Interaction Type: ${formData.interactionType}
${formData.competitiveContext ? `🏆 COMPETITIVE SITUATION: Active competition detected - Emphasize: ${metadata.competitiveDifferentiation.join(', ')}` : ''}

MARKET INTELLIGENCE:
${competitiveIntelligence}

VALUE CREATION FRAMEWORK:
Core Services Alignment: ${this.getCoreServicesAlignment(formData)}
Success Metrics Focus: ${this.getSuccessMetricsContext()}

TACTICAL EXECUTION:
Content Type: ${formData.outputType}
Channel Optimization: ${this.getChannelOptimization(formData)}
Response Timing: ${this.getOptimalTiming(formData.interactionType || 'email', formData.urgencyLevel)}

Now create a ${formData.outputType} that incorporates all these enterprise intelligence layers to resonate specifically with this ${segment.name} audience. Make it ${formData.urgencyLevel === 'high' ? 'urgent and action-oriented with immediate next steps' : formData.urgencyLevel === 'low' ? 'informative and relationship-building with educational value' : 'balanced and professional with clear value proposition'}.

Apply our ${this.ontology.foundation?.brandPersonality?.archetype || 'trusted advisor'} brand archetype while delivering on our brand promise of ${this.ontology.foundation?.brandPersonality?.brandPromise || 'certainty and expertise'}.`;

    return masterPrompt;
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

  /**
   * Apply cultural and regional modifiers based on segment geography and industry
   */
  private applyCulturalModifiers(formData: ContextFormData, segment: CustomerSegment): string {
    const culturalModifiers = this.ontology.intelligence?.contextualRulesEngine?.adaptiveMessaging?.cultural_modifiers;
    if (!culturalModifiers) return '';

    // Get primary geographic region for segment
    const geography = segment.demographics.geography;
    if (!geography) return '';

    const primaryRegion = Object.entries(geography).reduce((a, b) => 
      (geography[a[0]] || '0%').localeCompare(geography[b[0]] || '0%') > 0 ? a : b
    )[0];

    const regionalProfile = culturalModifiers.regional_differences?.[primaryRegion];
    if (!regionalProfile) return '';

    return `\nCULTURAL & REGIONAL CONTEXT:
Regional Communication Style (${primaryRegion}): ${regionalProfile.pace} pace, ${regionalProfile.style} style, ${regionalProfile.relationship} relationship approach`;
  }

  /**
   * Get stakeholder ecosystem context for the interaction
   */
  private getStakeholderContext(): string {
    const stakeholderEcosystem = this.ontology.relationships?.stakeholderEcosystem;
    if (!stakeholderEcosystem) return 'Key stakeholders: Investment decision makers, influencers, and advisors';

    const primaryStakeholders = Object.keys(stakeholderEcosystem.primary || {}).slice(0, 3);
    const secondaryStakeholders = Object.keys(stakeholderEcosystem.secondary || {}).slice(0, 2);

    return `Key Stakeholder Influences: ${primaryStakeholders.join(', ')} (primary), ${secondaryStakeholders.join(', ')} (secondary)
Remember: This decision often involves multiple stakeholders with different priorities and concerns`;
  }

  /**
   * Get competitive intelligence from market dynamics
   */
  private getCompetitiveIntelligence(): string {
    const marketDynamics = this.ontology.market?.marketDynamics;
    if (!marketDynamics) return 'Competitive landscape: Multiple alternative solutions exist';

    const threats = marketDynamics.competitiveLandscape?.competitiveThreats?.slice(0, 3).join(', ') || 'pricing pressure, market saturation';
    const opportunities = marketDynamics.competitiveLandscape?.marketOpportunities?.slice(0, 2).join(', ') || 'market growth, client needs evolution';

    return `Market Threats: ${threats}
Market Opportunities: ${opportunities}
Emerging Trends: ${marketDynamics.marketTrends?.emerging?.slice(0, 2).join(', ') || 'digital transformation, ESG focus'}`;
  }

  /**
   * Get sub-segment context for more targeted messaging
   */
  private getSubSegmentContext(segmentId: string): string {
    const segment = this.getCustomerSegment(segmentId);
    if (!segment) return 'General segment approach';

    // Check if this is already a sub-segment with parent segment reference
    const parentSegment = (segment as CustomerSegment & {parentSegment?: string}).parentSegment;
    if (parentSegment) {
      return `Sub-segment of ${parentSegment}: ${segment.description}`;
    }

    // Get related sub-segments from market hierarchy
    const segmentHierarchy = this.ontology.market?.segmentHierarchy;
    const subSegments = segmentHierarchy?.subSegments?.[segmentId];
    if (subSegments && subSegments.length > 0) {
      return `Potential sub-segments: ${subSegments.join(', ')} - Consider specific sub-segment needs`;
    }

    return 'Primary segment focus';
  }

  /**
   * Get geographic context for cultural adaptation
   */
  private getGeographicContext(segment: CustomerSegment): string {
    const geography = segment.demographics.geography;
    if (!geography) return 'Nationwide distribution';

    const regions = Object.entries(geography)
      .sort(([,a], [,b]) => (b || '0%').localeCompare(a || '0%'))
      .slice(0, 3)
      .map(([region, percentage]) => `${region} (${percentage})`)
      .join(', ');

    return regions || 'Distributed nationwide';
  }

  /**
   * Get core services alignment based on customer needs
   */
  private getCoreServicesAlignment(formData: ContextFormData): string {
    // First check journey stage specific offerings alignment
    const journeyStage = this.ontology.journeyStages.find(js => js.id === formData.journeyStage);
    const journeyOfferingsAlignment = (journeyStage as JourneyStage & {offeringsAlignment?: string[]})?.offeringsAlignment;
    
    if (journeyOfferingsAlignment && journeyOfferingsAlignment.length > 0) {
      return journeyOfferingsAlignment.slice(0, 3).join(', ');
    }

    // Fallback to core services based on segment targeting
    const coreServices = this.ontology.offerings?.coreServices;
    if (!coreServices) return 'Integrated capital and advisory services';

    const relevantServices = coreServices
      .filter(service => service.targetSegments.includes(formData.segment))
      .map(service => service.name)
      .slice(0, 2);

    return relevantServices.length > 0 ? relevantServices.join(', ') : 'Primary equity partnership services';
  }

  /**
   * Get success metrics context for value proposition
   */
  private getSuccessMetricsContext(): string {
    const successFrameworks = this.ontology.offerings?.successFrameworks?.valueCreation;
    if (!successFrameworks) return 'Revenue growth, operational efficiency, strategic positioning';

    const operational = successFrameworks.operational?.slice(0, 2).join(', ') || 'revenue growth, margin expansion';
    const strategic = successFrameworks.strategic?.slice(0, 2).join(', ') || 'market positioning, competitive advantage';

    return `Operational: ${operational} | Strategic: ${strategic}`;
  }

  /**
   * Get behavioral triggers context for personalization
   */
  private getBehavioralTriggersContext(segment: CustomerSegment): string {
    const behavioralTriggers = (segment.psychographics as Psychographics & {behavioralTriggers?: string[]})?.behavioralTriggers;
    if (!behavioralTriggers || behavioralTriggers.length === 0) {
      return 'Standard behavioral patterns apply';
    }

    return `Key Behavioral Triggers: ${behavioralTriggers.join(', ')} - Adapt messaging when these patterns are observed`;
  }

  /**
   * Get brand personality alignment for the segment
   */
  private getBrandPersonalityAlignment(segment: CustomerSegment): string {
    const brandAlignment = (segment as CustomerSegment & {brandPersonalityAlignment?: {primaryArchetype?: string; resonantValues?: string[]; communicationStyle?: string}})?.brandPersonalityAlignment;
    if (!brandAlignment) return '';

    return `Brand Alignment: ${brandAlignment.primaryArchetype || 'Not specified'} archetype with ${brandAlignment.resonantValues?.join(', ') || 'core values'} emphasis, ${brandAlignment.communicationStyle || 'standard communication style'}`;
  }

  /**
   * Get channel optimization recommendations
   */
  private getChannelOptimization(formData: ContextFormData): string {
    // First check journey stage specific channel effectiveness
    const journeyStage = this.ontology.journeyStages.find(js => js.id === formData.journeyStage);
    const journeyChannelEffectiveness = (journeyStage as JourneyStage & {channelEffectiveness?: Record<string, Record<string, number>>})?.channelEffectiveness?.[formData.segment];
    
    if (journeyChannelEffectiveness) {
      const topChannels = Object.entries(journeyChannelEffectiveness)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([channel, effectiveness]) => `${channel} (${Math.round((effectiveness as number) * 100)}% effective)`)
        .join(', ');
      
      if (topChannels) return topChannels;
    }

    // Fallback to engagement layer channel effectiveness
    const channelEffectiveness = this.ontology.engagement?.channelStrategy?.channelEffectiveness;
    if (!channelEffectiveness) return 'Multi-channel approach with personalized touch';

    const segmentChannels = channelEffectiveness[formData.segment];
    const journeyStageChannels = segmentChannels?.[formData.journeyStage];
    
    if (!journeyStageChannels) return 'Personalized outreach approach';

    const topChannels = Object.entries(journeyStageChannels)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([channel, effectiveness]) => `${channel} (${Math.round(effectiveness * 100)}% effective)`)
      .join(', ');

    return topChannels || 'Direct, personalized communication';
  }
}

// Export singleton instance
export const contextEngine = new ContextEngine();