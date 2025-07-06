'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ContextPreview } from './ContextPreview';
import { 
  ContextFormData, 
  GeneratedContext, 
  QualityMetrics,
  PainPointPriority,
  CustomerSegment,
  PainPoint 
} from '@/types/ontology';
import { contextEngine } from '@/lib/contextEngine';
import ontologyData from '@/data/ontology.json';
import { cn } from '@/utils/cn';
import { Zap, Users, Target, Building2 } from 'lucide-react';

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

export default function ContextBuilderForm({ className }: ContextBuilderFormProps) {
  const [formData, setFormData] = useState<ContextFormData>(INITIAL_FORM_DATA);
  const [generatedContext, setGeneratedContext] = useState<GeneratedContext | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(error instanceof Error ? error.message : 'Failed to generate context');
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

  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* 3-Column Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px] min-h-[800px]">
        {/* Left Column - Form Controls */}
        <div className="space-y-6">
          {/* Customer Segment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Segment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="segment">Select Segment</Label>
                <Select value={formData.segment} onValueChange={handleSegmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose customer segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {(ontologyData.customerSegments as CustomerSegment[]).map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <div className="flex items-center gap-2">
                          {segment.id === 'independent_sponsor' && <Users className="h-4 w-4" />}
                          {segment.id === 'legacy_founder' && <Building2 className="h-4 w-4" />}
                          <span>{segment.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.segment && (
                  <p className="text-xs text-gray-600 mt-2">
                    {(ontologyData.customerSegments as CustomerSegment[])
                      .find(s => s.id === formData.segment)?.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pain Points */}
          {formData.segment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(ontologyData.painPoints as PainPoint[]).map((painPoint) => {
                    const existingPriority = formData.painPointPriorities.find(p => p.painPointId === painPoint.id);
                    const isSelected = !!existingPriority;
                    
                    const getSeverityColor = (severity: string) => {
                      switch (severity) {
                        case 'extreme': return 'bg-red-100 text-red-700 text-xs';
                        case 'high': return 'bg-orange-100 text-orange-700 text-xs';
                        case 'medium': return 'bg-yellow-100 text-yellow-700 text-xs';
                        case 'low': return 'bg-green-100 text-green-700 text-xs';
                        default: return 'bg-gray-100 text-gray-700 text-xs';
                      }
                    };

                    const handlePainPointToggle = (painPointId: string, checked: boolean) => {
                      if (checked) {
                        const newPriority: PainPointPriority = {
                          painPointId,
                          weight: 1.0,
                          priority: formData.painPointPriorities.length + 1
                        };
                        handlePainPointsChange([...formData.painPointPriorities, newPriority]);
                      } else {
                        handlePainPointsChange(formData.painPointPriorities.filter(p => p.painPointId !== painPointId));
                      }
                    };

                    const handlePriorityChange = (painPointId: string, priority: number) => {
                      const updated = formData.painPointPriorities.map(p => 
                        p.painPointId === painPointId ? { ...p, priority } : p
                      );
                      handlePainPointsChange(updated);
                    };

                    return (
                      <div key={painPoint.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handlePainPointToggle(painPoint.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{painPoint.name}</span>
                            <Badge className={getSeverityColor(painPoint.severity)}>
                              {painPoint.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{painPoint.description}</p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Priority:</Label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={existingPriority?.priority || 1}
                              onChange={(e) => handlePriorityChange(painPoint.id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context & Output */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Context & Output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid gap-4 grid-cols-2">
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select 
                    value={formData.urgencyLevel} 
                    onValueChange={(value: string) => updateFormData({ urgencyLevel: value as 'low' | 'medium' | 'high' })}
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
                  <Label htmlFor="output-type">Output</Label>
                  <Select 
                    value={formData.outputType} 
                    onValueChange={(value: string) => updateFormData({ outputType: value as 'email' | 'presentation' | 'proposal' | 'strategy' | 'content' })}
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
                  onValueChange={(value: string) => updateFormData({ relationshipStage: value as 'first_interaction' | 'established' | 'partnership' })}
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
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Live Preview */}
        <div>
          <div className="sticky top-6 h-fit">
            <ContextPreview
              generatedContext={generatedContext}
              qualityMetrics={qualityMetrics}
              isLoading={isGenerating}
            />
          </div>
        </div>

        {/* Right Column - Templates & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => {
                  setFormData({
                    segment: 'independent_sponsor',
                    journeyStage: 'prospecting',
                    painPointPriorities: [
                      { painPointId: 'capital_raising_friction', weight: 1.0, priority: 1 },
                      { painPointId: 'no_margin_for_error', weight: 0.8, priority: 2 }
                    ],
                    urgencyLevel: 'high',
                    interactionType: 'email',
                    relationshipStage: 'first_interaction',
                    outputType: 'email'
                  });
                }}
              >
                🔥 Cold Outreach - Independent Sponsor
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => {
                  setFormData({
                    segment: 'legacy_founder',
                    journeyStage: 'evaluation',
                    painPointPriorities: [
                      { painPointId: 'legacy_preservation', weight: 1.0, priority: 1 },
                      { painPointId: 'succession_planning', weight: 0.9, priority: 2 }
                    ],
                    urgencyLevel: 'medium',
                    interactionType: 'email',
                    relationshipStage: 'established',
                    outputType: 'proposal'
                  });
                }}
              >
                🏢 Legacy Exit Proposal
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => {
                  setFormData({
                    segment: 'independent_sponsor',
                    journeyStage: 'due_diligence',
                    painPointPriorities: [
                      { painPointId: 'bandwidth_limitations', weight: 1.0, priority: 1 },
                      { painPointId: 'capital_raising_friction', weight: 0.7, priority: 2 }
                    ],
                    urgencyLevel: 'high',
                    interactionType: 'email',
                    relationshipStage: 'partnership',
                    outputType: 'strategy'
                  });
                }}
              >
                ⚡ Deal Support - Active Partnership
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {generatedContext && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={async () => {
                      const allPrompts = `SYSTEM PROMPT:\n${generatedContext.systemPrompt}\n\nCONTEXT PROMPT:\n${generatedContext.contextPrompt}\n\nTASK PROMPT:\n${generatedContext.taskPrompt}`;
                      await navigator.clipboard.writeText(allPrompts);
                    }}
                  >
                    📋 Copy All Prompts
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const dataStr = JSON.stringify(formData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'ai-context-config.json';
                      link.click();
                    }}
                  >
                    💾 Download Config
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}