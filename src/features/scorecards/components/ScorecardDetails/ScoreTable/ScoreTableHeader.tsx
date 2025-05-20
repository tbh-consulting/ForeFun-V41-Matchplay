import React from 'react';

interface ScoreTableHeaderProps {
  holes: number[];
}

export function ScoreTableHeader({ holes }: ScoreTableHeaderProps) {
  return (
    <tr className="bg-gray-800 text-white">
      <th className="p-3 text-left rounded-tl-lg w-[180px] bg-gray-800">Hole</th>
      {holes.map((holeNumber) => (
        <th key={holeNumber} className="p-3 text-center w-[80px]">
          {holeNumber}
        </th>
      ))}
      <th className="p-3 text-center rounded-tr-lg w-[100px]">Total</th>
    </tr>
  );
}