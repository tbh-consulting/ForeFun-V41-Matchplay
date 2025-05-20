import React from 'react';
import { ScoreInput } from './ScoreInput';
import { HandicapStrokesDisplay } from './HandicapStrokesDisplay';

interface HoleScoreProps {
  holeNumber: number;
  par: number;
  handicapStrokes: number;
  onChange?: (holeNumber: number, handicapStrokes: number) => void;
  isReadOnly?: boolean;
}

export function HoleScore({ 
  holeNumber, 
  par, 
  handicapStrokes,
  onChange,
  isReadOnly 
}: HoleScoreProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {isReadOnly ? (
        <div className="font-medium">
          {handicapStrokes || '-'}
        </div>
      ) : (
        <ScoreInput
          value={handicapStrokes}
          onChange={(value) => onChange?.(holeNumber, value)}
          disabled={isReadOnly}
          par={par}
        />
      )}
      <HandicapStrokesDisplay strokes={handicapStrokes} />
    </div>
  );
}