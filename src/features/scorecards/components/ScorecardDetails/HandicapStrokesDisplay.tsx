import React from 'react';

interface HandicapStrokesDisplayProps {
  strokes: number;
}

export function HandicapStrokesDisplay({ strokes }: HandicapStrokesDisplayProps) {
  // Always render a container div to maintain consistent height
  return (
    <div className="h-4 text-accent text-xs font-medium leading-none">
      {strokes > 0 && (
        <>
          {'•'.repeat(Math.min(strokes, 3))}
          {strokes > 3 && ` (${strokes})`}
        </>
      )}
    </div>
  );
}