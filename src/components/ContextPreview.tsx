'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { GeneratedContext, QualityMetrics } from '@/types/ontology';
import { cn } from '@/utils/cn';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MessageSquare,
  Target,
  Users
} from 'lucide-react';

interface ContextPreviewProps {
  generatedContext: GeneratedContext | null;
  qualityMetrics: QualityMetrics | null;
  isLoading?: boolean;
  className?: string;
}

interface QualityMetricCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
  suggestions?: string[];
}

const QualityMetricCard: React.FC<QualityMetricCardProps> = ({
  title,
  score,
  icon,
  description,
  suggestions = []
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <span className={cn("text-lg font-bold", getScoreColor(score))}>
            {Math.round(score)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Progress 
            value={score} 
            className={cn(
              "h-2",
              score >= 80 ? "[&>div]:bg-green-500" : 
              score >= 60 ? "[&>div]:bg-yellow-500" : 
              "[&>div]:bg-red-500"
            )}
          />
        </div>
        <p className="text-xs text-gray-600 mb-3">{description}</p>
        {suggestions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Suggestions:</p>
            {suggestions.map((suggestion, index) => (
              <p key={index} className="text-xs text-blue-600">• {suggestion}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PromptSectionProps {
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  copyable?: boolean;
}

// Legacy component - removed from UI but kept for compatibility
const PromptSection: React.FC<PromptSectionProps> = () => null;

export const ContextPreview: React.FC<ContextPreviewProps> = ({
  generatedContext,
  qualityMetrics,
  isLoading = false,
  className
}) => {
  // Legacy state - no longer used in simplified UI
  const [, setExpandedSections] = useState<Record<string, boolean>>({});
  const toggleSection = () => {};

  const handleDownload = () => {
    if (!generatedContext) return;

    const content = `# AI Context Export\n\n## System Prompt\n${generatedContext.systemPrompt}\n\n## Context Prompt\n${generatedContext.contextPrompt}\n\n## Task Prompt\n${generatedContext.taskPrompt}\n\n## Metadata\n${JSON.stringify(generatedContext.metadata, null, 2)}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-context-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Generating context...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!generatedContext || !qualityMetrics) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Context Generated</h4>
            <p className="text-sm text-gray-500">
              Complete the form to see your AI context preview and quality metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallScore = qualityMetrics.overallScore * 100;
  const getOverallColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Context Quality Score
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className={cn("text-2xl font-bold", getOverallColor(overallScore))}>
                {Math.round(overallScore)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={overallScore} 
            className={cn(
              "mb-4 h-3",
              overallScore >= 80 ? "[&>div]:bg-green-500" : 
              overallScore >= 60 ? "[&>div]:bg-yellow-500" : 
              "[&>div]:bg-red-500"
            )}
          />
          
          {generatedContext.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Optimization Suggestions
              </h4>
              {generatedContext.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">{suggestion.title}</p>
                  <p className="text-xs text-yellow-700 mt-1">{suggestion.description}</p>
                  {suggestion.impact && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "mt-2 text-xs",
                        suggestion.impact === 'high' && "border-red-300 text-red-700",
                        suggestion.impact === 'medium' && "border-yellow-300 text-yellow-700",
                        suggestion.impact === 'low' && "border-blue-300 text-blue-700"
                      )}
                    >
                      {suggestion.impact} impact
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Metrics Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QualityMetricCard
          title="Completeness"
          score={qualityMetrics.completenessScore * 100}
          icon={<CheckCircle className="h-4 w-4 text-blue-600" />}
          description="How much context information is provided"
          suggestions={overallScore < 70 ? ["Add competitive context", "Include company profile"] : []}
        />
        <QualityMetricCard
          title="Specificity"
          score={qualityMetrics.specificityScore * 100}
          icon={<Target className="h-4 w-4 text-purple-600" />}
          description="How personalized and specific the context is"
          suggestions={qualityMetrics.specificityScore < 0.6 ? ["Add custom pain points", "Include specific objectives"] : []}
        />
        <QualityMetricCard
          title="Differentiation"
          score={qualityMetrics.differentiationScore * 100}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          description="How well positioned against competition"
          suggestions={qualityMetrics.differentiationScore < 0.5 ? ["Define competitive alternatives", "Add unique value props"] : []}
        />
        <QualityMetricCard
          title="Voice Alignment"
          score={qualityMetrics.voiceAlignmentScore * 100}
          icon={<Users className="h-4 w-4 text-orange-600" />}
          description="How well voice matches the situation"
          suggestions={qualityMetrics.voiceAlignmentScore < 0.8 ? ["Review segment selection", "Check situational context"] : []}
        />
      </div>

      {/* Master Prompt */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Master Prompt for Content Creation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generatedContext.systemPrompt);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                  }
                }}
                className="h-8"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Prompt
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Copy this prompt and paste it into ChatGPT, Claude, or any AI tool to create content that resonates with your target audience.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 leading-relaxed">
              {generatedContext.systemPrompt}
            </pre>
          </div>
          <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded p-3">
            <strong>Usage:</strong> Copy the prompt above → Paste into your AI tool → Add your specific content request (e.g., &ldquo;Create a LinkedIn post about our new feature&rdquo;)
          </div>
        </CardContent>
      </Card>

      {/* Context Metadata */}
      {generatedContext.metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Context Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">Voice Weights</h4>
                <div className="space-y-1">
                  {Object.entries(generatedContext.metadata.voiceWeights).map(([voice, weight]) => (
                    <div key={voice} className="flex justify-between text-sm">
                      <span className="capitalize">{voice.replace('_', ' ')}</span>
                      <span className="font-mono">{Math.round(weight * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Channel Recommendations</h4>
                <div className="space-y-1">
                  {generatedContext.metadata.channelRecommendations.slice(0, 3).map((channel, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="capitalize">{channel.channel.replace('_', ' ')}</span>
                      <span className="font-mono">{Math.round(channel.effectiveness * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};