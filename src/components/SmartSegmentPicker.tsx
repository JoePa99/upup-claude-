'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CustomerSegment } from '@/types/ontology';
import { cn } from '@/utils/cn';
import { Users, TrendingUp, Building2 } from 'lucide-react';

interface SmartSegmentPickerProps {
  segments: CustomerSegment[];
  selectedSegment?: string;
  onSegmentChange: (segmentId: string) => void;
  className?: string;
}

interface SegmentCardProps {
  segment: CustomerSegment;
  isSelected: boolean;
  fitScore: number;
  onClick: () => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ 
  segment, 
  isSelected, 
  fitScore, 
  onClick 
}) => {
  const getIcon = (segmentId: string) => {
    switch (segmentId) {
      case 'independent_sponsor':
        return <Users className="h-6 w-6" />;
      case 'legacy_founder':
        return <Building2 className="h-6 w-6" />;
      default:
        return <TrendingUp className="h-6 w-6" />;
    }
  };

  const getFitColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
            )}>
              {getIcon(segment.id)}
            </div>
            <div>
              <CardTitle className="text-lg">{segment.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {segment.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              {fitScore}% fit
            </Badge>
            <div className={cn(
              "w-2 h-2 rounded-full",
              getFitColor(fitScore)
            )} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Key Characteristics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Age: {segment.demographics.ageRange}</div>
              <div>Education: {segment.demographics.education}</div>
              <div>Income: {segment.demographics.income}</div>
              <div>Company: {segment.demographics.companySize}</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Primary Motivations</h4>
            <div className="flex flex-wrap gap-1">
              {segment.psychographics.primaryMotivations.slice(0, 3).map((motivation, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {motivation.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Top Pain Points</h4>
            <div className="flex flex-wrap gap-1">
              {segment.painPoints.slice(0, 2).map((painPoint, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {painPoint.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SmartSegmentPicker: React.FC<SmartSegmentPickerProps> = ({
  segments,
  selectedSegment,
  onSegmentChange,
  className
}) => {
  // Calculate fit scores (in a real app, this would be based on user's company profile)
  const calculateFitScore = (segment: CustomerSegment): number => {
    // For demo purposes, assign different scores
    const fitScores: Record<string, number> = {
      'independent_sponsor': 85,
      'legacy_founder': 72,
    };
    return fitScores[segment.id] || 60;
  };

  const segmentsWithFit = segments.map(segment => ({
    ...segment,
    fitScore: calculateFitScore(segment)
  })).sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Choose Your Customer Segment</h3>
        <p className="text-sm text-gray-600">
          Select the segment that best matches your target audience. We&apos;ll customize the context accordingly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {segmentsWithFit.map((segment) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            isSelected={selectedSegment === segment.id}
            fitScore={segment.fitScore}
            onClick={() => onSegmentChange(segment.id)}
          />
        ))}
      </div>

      {selectedSegment && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-blue-900">
              Segment Selected: {segments.find(s => s.id === selectedSegment)?.name}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Context will be optimized for this segment&apos;s preferences, pain points, and communication style.
          </p>
        </div>
      )}
    </div>
  );
};