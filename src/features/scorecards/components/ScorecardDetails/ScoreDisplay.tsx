import React from 'react';

interface ScoreDisplayProps {
  handicapStrokes: number;
  par: number;
}

export function ScoreDisplay({ handicapStrokes, par }: ScoreDisplayProps) {
  const getScoreColor = () => {
    const relativeToPar = handicapStrokes - par;
    if (relativeToPar < 0) return 'text-green-600';
    if (relativeToPar > 0) return 'text-red-600';
    return 'text-gray-900';
  };

  return (
    <span className={`font-medium ${getScoreColor()}`}>
      {handicapStrokes || '-'}
    </span>
  );
}