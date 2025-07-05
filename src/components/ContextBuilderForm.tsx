'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { SmartSegmentPicker } from './SmartSegmentPicker';
import { DragDropPainPointRanker } from './DragDropPainPointRanker';
import { ContextPreview } from './ContextPreview';
import { 
  ContextFormData, 
  GeneratedContext, 
  QualityMetrics,
  PainPointPriority 
} from '@/types/ontology';
import { contextEngine } from '@/lib/contextEngine';
import ontologyData from '@/data/ontology.json';
import { cn } from '@/utils/cn';
import { ArrowRight, ArrowLeft, Zap, Users, Target } from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
}

interface ContextBuilderFormProps {
  className?: string;
}

const INITIAL_FORM_DATA: ContextFormData = {
  segment: '',
  journeyStage: '',
  painPointPriorities: [],
  urgencyLevel: 'medium',
  interactionType: 'email',
  relationshipStage: 'first_interaction',
  outputType: 'email'
};

const FORM_STEPS: FormStep[] = [
  {
    id: 'segment',
    title: 'Customer Segment',
    description: 'Identify your target audience',
    icon: <Users className="h-5 w-5" />,
    component: SmartSegmentPicker
  },
  {
    id: 'pain_points',
    title: 'Pain Points',
    description: 'Prioritize customer challenges',
    icon: <Target className="h-5 w-5" />,
    component: DragDropPainPointRanker
  },
  {
    id: 'context',
    title: 'Context & Output',
    description: 'Situational details and output type',
    icon: <Zap className="h-5 w-5" />,
    component: () => null // Handled inline
  }
];

export default function ContextBuilderForm({ className }: ContextBuilderFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ContextFormData>(INITIAL_FORM_DATA);
  const [generatedContext, setGeneratedContext] = useState<GeneratedContext | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Generate context whenever form data changes (with debounce)
  useEffect(() => {
    if (!formData.segment || formData.painPointPriorities.length === 0) {
      setGeneratedContext(null);
      setQualityMetrics(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        setIsGenerating(true);
        const context = contextEngine.generateContext(formData);
        setGeneratedContext(context);
        setQualityMetrics({
          completenessScore: context.qualityScore,
          specificityScore: context.qualityScore * 0.8,
          differentiationScore: formData.competitiveContext ? 0.8 : 0.3,
          voiceAlignmentScore: 0.85,
          overallScore: context.qualityScore
        });
      } catch (error) {
        console.error('Error generating context:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const updateFormData = (updates: Partial<ContextFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSegmentChange = (segmentId: string) => {
    updateFormData({ segment: segmentId, painPointPriorities: [] });
  };

  const handlePainPointsChange = (painPoints: PainPointPriority[]) => {
    updateFormData({ painPointPriorities: painPoints });
  };

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPreview(true);
    }
  };

  const prevStep = () => {
    if (showPreview) {
      setShowPreview(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: // Segment selection
        return Boolean(formData.segment);
      case 1: // Pain points
        return formData.painPointPriorities.length > 0;
      case 2: // Context
        return Boolean(formData.journeyStage && formData.outputType);
      default:
        return false;
    }
  }, [currentStep, formData]);

  const getStepProgress = () => {
    return showPreview ? 100 : ((currentStep + 1) / FORM_STEPS.length) * 100;
  };

  if (showPreview) {
    return (
      <div className={cn("max-w-6xl mx-auto p-6", className)}>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={prevStep}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
          <h1 className="text-3xl font-bold mb-2">AI Context Preview</h1>
          <p className="text-gray-600">
            Review your generated context and quality metrics
          </p>
        </div>

        <ContextPreview
          generatedContext={generatedContext}
          qualityMetrics={qualityMetrics}
          isLoading={isGenerating}
        />
      </div>
    );
  }

  const currentStepData = FORM_STEPS[currentStep];

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Context Builder</h1>
        <p className="text-gray-600 mb-6">
          Build intelligent context for better AI interactions with your customers
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {FORM_STEPS.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "flex flex-col items-center cursor-pointer transition-colors",
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              )}
              onClick={() => index <= currentStep && setCurrentStep(index)}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                index <= currentStep 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-400"
              )}>
                {step.icon}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {currentStepData.icon}
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              {/* Step Content */}
              {currentStep === 0 && (
                <SmartSegmentPicker
                  segments={ontologyData.customerSegments}
                  selectedSegment={formData.segment}
                  onSegmentChange={handleSegmentChange}
                />
              )}

              {currentStep === 1 && formData.segment && (
                <DragDropPainPointRanker
                  painPoints={ontologyData.painPoints}
                  selectedPainPoints={formData.painPointPriorities}
                  onPainPointsChange={handlePainPointsChange}
                  segmentId={formData.segment}
                />
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="journey-stage">Journey Stage</Label>
                      <Select 
                        value={formData.journeyStage} 
                        onValueChange={(value) => updateFormData({ journeyStage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select journey stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {ontologyData.journeyStages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select 
                        value={formData.urgencyLevel} 
                        onValueChange={(value: any) => updateFormData({ urgencyLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interaction-type">Interaction Type</Label>
                      <Select 
                        value={formData.interactionType} 
                        onValueChange={(value: any) => updateFormData({ interactionType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="output-type">Output Type</Label>
                      <Select 
                        value={formData.outputType} 
                        onValueChange={(value: any) => updateFormData({ outputType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="strategy">Strategy</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="relationship-stage">Relationship Stage</Label>
                    <Select 
                      value={formData.relationshipStage} 
                      onValueChange={(value: any) => updateFormData({ relationshipStage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_interaction">First Interaction</SelectItem>
                        <SelectItem value="established">Established Relationship</SelectItem>
                        <SelectItem value="partnership">Active Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                >
                  {currentStep === FORM_STEPS.length - 1 ? 'Preview Context' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ContextPreview
              generatedContext={generatedContext}
              qualityMetrics={qualityMetrics}
              isLoading={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}