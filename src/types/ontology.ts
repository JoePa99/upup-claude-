// Core Types for Business Intelligence Ontology
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  demographics: Demographics;
  psychographics: Psychographics;
  painPoints: string[];
  journeyStages: string[];
  voicePreferences: VoicePreference[];
  decisionFactors: string[];
  communicationPreferences: string[];
}

export interface Demographics {
  ageRange: string;
  averageAge?: number;
  genderSplit: string;
  education: string;
  income: string;
  companySize?: string;
  industry?: string[];
  geography?: GeographicDistribution;
}

export interface GeographicDistribution {
  [region: string]: string | undefined; // percentage as string like "30%" or undefined
}

export interface Psychographics {
  primaryMotivations: string[];
  coreFears: string[];
  valuesHierarchy: string[];
  workStyle?: string;
  decisionMaking?: string;
  networking?: string;
}

export interface PainPoint {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant' | 'every_deal';
  impact: string;
  relatedMessages?: string[];
  proofPointTypes?: string[];
}

export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  duration: string;
  actions: string[];
  touchpoints: string[];
  mindset: string;
  painPoints: string[];
  successMetrics: string[];
  preferredChannels: string[];
}

export interface VoiceAttribute {
  id: string;
  name: string;
  description: string;
  emotionalTrigger: string;
  communicationStyle: string;
  proofPoints: string[];
  do: string[];
  dont: string[];
  keyPhrases: string[];
  weight?: number;
}

export interface VoicePreference {
  primary: string;
  secondary: string;
  situationalModifiers: SituationalModifier[];
}

export interface SituationalModifier {
  condition: string;
  voiceAdjustment: string;
  weight: number;
  reasoning: string;
}

export interface CompetitiveContext {
  competitors: Competitor[];
  differentiators: string[];
  competitiveAdvantages: string[];
  threats: string[];
  positioning: CompetitivePositioning;
}

export interface Competitor {
  id: string;
  name: string;
  similarityScore: 'low' | 'medium' | 'high';
  differentiators: string[];
  competitiveResponse: string;
  marketPosition: string;
}

export interface CompetitivePositioning {
  functionalBenefit: string;
  emotionalBenefit: string;
  culturalRole: string;
  brandPurpose: string;
  hotTake?: string;
}

export interface MessageFramework {
  id: string;
  name: string;
  painPointId: string;
  voiceAttributes: string[];
  structure: MessageStructure;
  templates: MessageTemplates;
  proofPointPriorities: string[];
}

export interface MessageStructure {
  hook: string;
  body: string;
  close: string;
}

export interface MessageTemplates {
  hookOptions: string[];
  bodyFramework: string;
  closeOptions: string[];
}

export interface ContextFormData {
  // Customer Profile
  segment: string;
  subSegment?: string;
  demographics?: Partial<Demographics>;
  customPainPoints?: string[];
  
  // Situation Context
  journeyStage: string;
  painPointPriorities: PainPointPriority[];
  urgencyLevel: 'low' | 'medium' | 'high';
  competitiveContext?: CompetitiveContext;
  
  // Business Context
  companyProfile?: CompanyProfile;
  strategicObjectives?: string[];
  
  // Interaction Context
  interactionType: 'email' | 'presentation' | 'proposal' | 'meeting' | 'social';
  relationshipStage: 'first_interaction' | 'established' | 'partnership';
  channelPreferences?: string[];
  
  // Output Requirements
  outputType: 'email' | 'presentation' | 'proposal' | 'strategy' | 'content';
  lengthRequirement?: string;
  specificRequirements?: string[];
}

export interface PainPointPriority {
  painPointId: string;
  priority: number; // 1-10
  weight: number; // 0-1
  reasoning?: string;
}

export interface CompanyProfile {
  industry: string[];
  companySize: string;
  revenueRange: string;
  businessModel: string;
  coreCapabilities: string[];
  competitiveAdvantages: string[];
  culture: CompanyCulture;
}

export interface CompanyCulture {
  values: string[];
  philosophy: string;
  decisionMaking: string;
}

export interface GeneratedContext {
  systemPrompt: string;
  contextPrompt: string;
  taskPrompt: string;
  metadata: ContextMetadata;
  qualityScore: number;
  suggestions: OptimizationSuggestion[];
}

export interface ContextMetadata {
  voiceWeights: Record<string, number>;
  messageFramework: string;
  channelRecommendations: ChannelRecommendation[];
  confidenceScores: Record<string, number>;
  competitiveDifferentiation: string[];
}

export interface ChannelRecommendation {
  channel: string;
  effectiveness: number;
  timing: string;
  format: string;
  reasoning: string;
}

export interface OptimizationSuggestion {
  type: 'completeness' | 'specificity' | 'differentiation' | 'voice_alignment';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  fieldToImprove?: string;
}

export interface QualityMetrics {
  completenessScore: number;
  specificityScore: number;
  differentiationScore: number;
  voiceAlignmentScore: number;
  overallScore: number;
}

export interface SuggestionItem {
  id: string;
  value: string;
  label: string;
  description?: string;
  confidence: number;
  reasoning?: string;
  category?: string;
}

export interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// API Types
export interface ContextGenerationRequest {
  formData: ContextFormData;
  userId?: string;
  sessionId?: string;
  previousContext?: string;
}

export interface ContextGenerationResponse {
  success: boolean;
  context: GeneratedContext;
  qualityMetrics: QualityMetrics;
  suggestions: OptimizationSuggestion[];
  error?: string;
}

export interface SuggestionRequest {
  fieldName: string;
  currentValue: string;
  formContext: Partial<ContextFormData>;
  limit?: number;
}

export interface SuggestionResponse {
  suggestions: SuggestionItem[];
  reasoning?: string;
  confidence: number;
}

// Enhanced Enterprise Ontology Data Structure
export interface OntologyData {
  foundation: FoundationLayer;
  market: MarketLayer;
  customerSegments: CustomerSegment[];
  offerings: OfferingsLayer;
  engagement: EngagementLayer;
  relationships: RelationshipsLayer;
  intelligence: IntelligenceLayer;
  voiceAttributes: VoiceAttribute[];
  painPoints: PainPoint[];
  journeyStages: JourneyStage[];
  messageFrameworks?: MessageFramework[];
  competitiveContexts?: CompetitiveContext[];
  relationshipRules: RelationshipRule[];
}

// Foundation Layer - Company Identity & Business Model
export interface FoundationLayer {
  companyProfile: EnterpriseCompanyProfile;
  businessModel: BusinessModel;
  brandPersonality: BrandPersonality;
}

export interface EnterpriseCompanyProfile {
  name: string;
  foundedYear: number;
  headquarters: string;
  missionStatement: string;
  coreValues: string[];
  culturalAttributes: CulturalAttributes;
}

export interface CulturalAttributes {
  decisionMaking: string;
  riskTolerance: string;
  communicationStyle: string;
  workingStyle: string;
}

export interface BusinessModel {
  primaryModel: string;
  revenueStreams: RevenueStream[];
  valueProposition: ValueProposition;
}

export interface RevenueStream {
  type: string;
  percentage: number;
  description: string;
}

export interface ValueProposition {
  primary: string;
  differentiators: string[];
  competitiveAdvantages: string[];
}

export interface BrandPersonality {
  archetype: string;
  tonalAttributes: TonalAttributes;
  brandPromise: string;
  emotionalBenefits: string[];
}

export interface TonalAttributes {
  primary: string;
  secondary: string;
  situational: string;
}

// Market Layer - Segment Hierarchy & Market Dynamics
export interface MarketLayer {
  segmentHierarchy: SegmentHierarchy;
  marketDynamics: MarketDynamics;
}

export interface SegmentHierarchy {
  primarySegments: string[];
  subSegments: Record<string, string[]>;
  crossSegmentBehaviors: CrossSegmentBehaviors;
}

export interface CrossSegmentBehaviors {
  deal_size_preferences: Record<string, string>;
  industry_focus: string[];
}

export interface MarketDynamics {
  competitiveLandscape: CompetitiveLandscape;
  marketTrends: MarketTrends;
}

export interface CompetitiveLandscape {
  directCompetitors: string[];
  indirectCompetitors: string[];
  competitiveThreats: string[];
  marketOpportunities: string[];
}

export interface MarketTrends {
  emerging: string[];
  declining: string[];
}

// Offerings Layer - Services & Value Creation
export interface OfferingsLayer {
  coreServices: CoreService[];
  valueAddServices: ValueAddService[];
  successFrameworks: SuccessFrameworks;
}

export interface CoreService {
  id: string;
  name: string;
  description: string;
  targetSegments: string[];
  valueDrivers: string[];
  deliveryModel: string;
  typicalEngagement: string;
}

export interface ValueAddService {
  category: string;
  services: string[];
}

export interface SuccessFrameworks {
  valueCreation: ValueCreation;
}

export interface ValueCreation {
  operational: string[];
  strategic: string[];
  financial: string[];
}

// Engagement Layer - Customer Journey & Channel Strategy
export interface EngagementLayer {
  customerJourneyMapping: CustomerJourneyMapping;
  channelStrategy: ChannelStrategy;
}

export interface CustomerJourneyMapping {
  dynamicStages: DynamicStages;
  touchpointOptimization: TouchpointOptimization;
}

export interface DynamicStages {
  triggers: Record<string, string[]>;
  regressionRisks: Record<string, string[]>;
}

export interface TouchpointOptimization {
  high_impact_moments: string[];
  relationship_building: string[];
}

export interface ChannelStrategy {
  omnichannel: OmnichannelStrategy;
  channelEffectiveness: Record<string, Record<string, Record<string, number>>>;
}

export interface OmnichannelStrategy {
  digital: ChannelGroup;
  traditional: ChannelGroup;
}

export interface ChannelGroup {
  primary: string[];
  emerging?: string[];
  specialized?: string[];
}

// Relationships Layer - Stakeholder Ecosystem
export interface RelationshipsLayer {
  stakeholderEcosystem: StakeholderEcosystem;
  relationshipManagement: RelationshipManagement;
}

export interface StakeholderEcosystem {
  primary: StakeholderGroup;
  secondary: StakeholderGroup;
}

export interface StakeholderGroup {
  [category: string]: Record<string, StakeholderProfile>;
}

export interface StakeholderProfile {
  influence: 'low' | 'medium' | 'high';
  relationship_type: string;
  key_concerns: string[];
}

export interface RelationshipManagement {
  stakeholder_priorities: Record<string, string[]>;
  communication_cadence: Record<string, string>;
}

// Intelligence Layer - Contextual Rules & Performance Tracking
export interface IntelligenceLayer {
  contextualRulesEngine: ContextualRulesEngine;
  performanceTracking: PerformanceTracking;
}

export interface ContextualRulesEngine {
  adaptiveMessaging: AdaptiveMessaging;
  dynamic_personalization: DynamicPersonalization;
}

export interface AdaptiveMessaging {
  situational_modifiers: SituationalModifier[];
  cultural_modifiers: CulturalModifiers;
}

export interface CulturalModifiers {
  regional_differences: Record<string, RegionalProfile>;
  industry_preferences: Record<string, IndustryProfile>;
}

export interface RegionalProfile {
  pace: string;
  style: string;
  relationship: string;
}

export interface IndustryProfile {
  communication: string;
  proof_points: string;
  timeline: string;
}

export interface DynamicPersonalization {
  behavioral_triggers: BehavioralTrigger[];
}

export interface BehavioralTrigger {
  trigger: string;
  personality_indicator: string;
  messaging_adaptation: string;
}

export interface PerformanceTracking {
  leadingIndicators: IndicatorGroup;
  laggingIndicators: IndicatorGroup;
  optimization_framework: OptimizationFramework;
}

export interface IndicatorGroup {
  [category: string]: string[];
}

export interface OptimizationFramework {
  continuous_improvement: ContinuousImprovement;
}

export interface ContinuousImprovement {
  feedback_loops: string[];
  adaptation_triggers: string[];
}

export interface RelationshipRule {
  id: string;
  name: string;
  condition: RuleCondition;
  effect: RuleEffect;
  priority: number;
  confidence: number;
}

export interface RuleCondition {
  segment?: string;
  painPoint?: string;
  journeyStage?: string;
  competitiveContext?: string;
}

export interface RuleEffect {
  voiceAdjustment?: Record<string, number>;
  messageEmphasis?: string[];
  channelPreference?: string[];
  proofPointPriority?: string[];
}