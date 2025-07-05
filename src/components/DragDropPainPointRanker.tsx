'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PainPoint, PainPointPriority } from '@/types/ontology';
import { cn } from '@/utils/cn';
import { GripVertical, AlertTriangle, Plus, Minus } from 'lucide-react';

interface DragDropPainPointRankerProps {
  painPoints: PainPoint[];
  selectedPainPoints: PainPointPriority[];
  onPainPointsChange: (painPoints: PainPointPriority[]) => void;
  segmentId?: string;
  className?: string;
}

interface DraggablePainPointProps {
  painPoint: PainPoint;
  priority: PainPointPriority;
  index: number;
  onWeightChange: (painPointId: string, weight: number) => void;
  onRemove: (painPointId: string) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const DraggablePainPoint: React.FC<DraggablePainPointProps> = ({
  painPoint,
  priority,
  index,
  onWeightChange,
  onRemove,
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'every_deal': 'destructive',
      'constant': 'destructive',
      'frequent': 'default',
      'occasional': 'secondary',
      'rare': 'secondary'
    };
    return variants[frequency] || 'secondary';
  };

  return (
    <Card 
      className={cn(
        "cursor-move transition-all duration-200",
        isDragging && "opacity-50 scale-105 shadow-lg"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-blue-600">#{priority.priority}</span>
                <CardTitle className="text-base">{painPoint.name}</CardTitle>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  painPoint.severity === 'extreme' && "text-red-500",
                  painPoint.severity === 'high' && "text-orange-500",
                  painPoint.severity === 'medium' && "text-yellow-500",
                  painPoint.severity === 'low' && "text-green-500"
                )} />
              </div>
              <p className="text-sm text-gray-600 mb-3">{painPoint.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={cn("text-xs", getSeverityColor(painPoint.severity))}>
                  {painPoint.severity} severity
                </Badge>
                <Badge variant={getFrequencyBadge(painPoint.frequency)} className="text-xs">
                  {painPoint.frequency.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs text-gray-500">
                <strong>Impact:</strong> {painPoint.impact}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(painPoint.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Weight: {Math.round(priority.weight * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={priority.weight}
              onChange={(e) => onWeightChange(painPoint.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
          </div>

          {priority.reasoning && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Why this matters:</strong> {priority.reasoning}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DragDropPainPointRanker: React.FC<DragDropPainPointRankerProps> = ({
  painPoints,
  selectedPainPoints,
  onPainPointsChange,
  segmentId,
  className
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [availablePainPoints, setAvailablePainPoints] = useState<PainPoint[]>([]);

  useEffect(() => {
    // Filter pain points based on segment
    const selectedIds = selectedPainPoints.map(pp => pp.painPointId);
    const available = painPoints.filter(pp => !selectedIds.includes(pp.id));
    setAvailablePainPoints(available);
  }, [painPoints, selectedPainPoints, segmentId]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newPainPoints = [...selectedPainPoints];
    const draggedItem = newPainPoints[draggedIndex];
    
    // Remove dragged item
    newPainPoints.splice(draggedIndex, 1);
    
    // Insert at new position
    newPainPoints.splice(dropIndex, 0, draggedItem);
    
    // Update priorities
    const updatedPainPoints = newPainPoints.map((pp, index) => ({
      ...pp,
      priority: index + 1
    }));

    onPainPointsChange(updatedPainPoints);
    setDraggedIndex(null);
  };

  const handleWeightChange = (painPointId: string, weight: number) => {
    const updated = selectedPainPoints.map(pp => 
      pp.painPointId === painPointId ? { ...pp, weight } : pp
    );
    onPainPointsChange(updated);
  };

  const handleRemove = (painPointId: string) => {
    const updated = selectedPainPoints
      .filter(pp => pp.painPointId !== painPointId)
      .map((pp, index) => ({ ...pp, priority: index + 1 }));
    onPainPointsChange(updated);
  };

  const handleAdd = (painPoint: PainPoint) => {
    const newPriority: PainPointPriority = {
      painPointId: painPoint.id,
      priority: selectedPainPoints.length + 1,
      weight: 0.5,
      reasoning: `Added based on ${segmentId} segment analysis`
    };
    onPainPointsChange([...selectedPainPoints, newPriority]);
  };

  const totalWeight = selectedPainPoints.reduce((sum, pp) => sum + pp.weight, 0);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Prioritize Pain Points</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag to reorder by importance. Adjust weights to fine-tune the context impact.
        </p>
        
        {totalWeight > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Total Weight:</strong> {Math.round(totalWeight * 100)}% 
              {totalWeight > 1 && " (Consider reducing some weights for better balance)"}
            </p>
          </div>
        )}
      </div>

      {selectedPainPoints.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Pain Points Selected</h4>
            <p className="text-sm text-gray-500 mb-4">
              Add pain points from the available options below to start building context.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedPainPoints.map((priority, index) => {
            const painPoint = painPoints.find(pp => pp.id === priority.painPointId);
            if (!painPoint) return null;

            return (
              <div
                key={priority.painPointId}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <DraggablePainPoint
                  painPoint={painPoint}
                  priority={priority}
                  index={index}
                  onWeightChange={handleWeightChange}
                  onRemove={handleRemove}
                  isDragging={draggedIndex === index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
            );
          })}
        </div>
      )}

      {availablePainPoints.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">Available Pain Points</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {availablePainPoints.map((painPoint) => (
              <Card key={painPoint.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium mb-1">{painPoint.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{painPoint.description}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {painPoint.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {painPoint.frequency.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAdd(painPoint)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};