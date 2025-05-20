import React from 'react';
import { ScoreInput } from '../ScoreInput';
import { HandicapStrokesDisplay } from '../HandicapStrokesDisplay';

interface ScoreTableRowProps {
  label: string;
  values: (string | number | null)[];
  total?: number | null;
  showHandicapStrokes?: boolean;
  handicapStrokes?: number[];
  onScoreChange?: (index: number, value: number) => void;
  isDisabled?: boolean;
  par?: number[];
}

export function ScoreTableRow({
  label,
  values,
  total,
  showHandicapStrokes,
  handicapStrokes,
  onScoreChange,
  isDisabled,
  par
}: ScoreTableRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="p-3 font-medium text-gray-700 w-[180px] bg-white">
        {label}
      </td>
      {values.map((value, index) => (
        <td key={index} className="p-3 text-center w-[80px]">
          {onScoreChange ? (
            <div className="flex flex-col items-center gap-1">
              <ScoreInput
                value={value as number}
                onChange={(newValue) => onScoreChange(index, newValue)}
                disabled={isDisabled}
                par={par?.[index] || 0}
              />
              {showHandicapStrokes && (
                <HandicapStrokesDisplay strokes={handicapStrokes?.[index] || 0} />
              )}
            </div>
          ) : (
            value
          )}
        </td>
      ))}
      <td className="p-3 text-center font-bold w-[100px]">{total ?? '-'}</td>
    </tr>
  );
}