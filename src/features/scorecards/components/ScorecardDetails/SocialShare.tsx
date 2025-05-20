import React, { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast/useToast';
import html2canvas from 'html2canvas';
import { CourseHole } from '@/features/courses/types';

interface SocialShareProps {
  scorecardId: string;
  courseName: string;
  date: Date;
  holes: CourseHole[];
  players: Array<{
    username: string;
    handicap?: number | null;
    relativeScore: number | null;
    points: number | null;
    scores: Record<number, { gross: number | null; points: number | null; handicapStrokes: number }>;
  }>;
  onClose: () => void;
}

export function SocialShare({ scorecardId, courseName, date, holes, players, onClose }: SocialShareProps) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const createTable = (holes: CourseHole[], title: string, showTotal: boolean = false) => {
    const headerRow = `
      <tr class="bg-gray-800 text-white">
        <th class="p-3 text-left w-[140px]">Hole</th>
        ${holes.map(h => `<th class="p-3 text-center w-[80px]">${h.holeNumber}</th>`).join('')}
        <th class="p-3 text-center w-[100px]">Out</th>
        ${showTotal ? '<th class="p-3 text-center w-[100px]">Total</th>' : '<th class="p-3 text-center w-[100px]"></th>'}
      </tr>
    `;

    const parRow = `
      <tr class="bg-gray-50">
        <td class="p-3 font-medium">Par</td>
        ${holes.map(h => `<td class="p-3 text-center">${h.par}</td>`).join('')}
        <td class="p-3 text-center font-bold">${holes.reduce((sum, h) => sum + h.par, 0)}</td>
        ${showTotal ? `<td class="p-3 text-center font-bold">72</td>` : '<td></td>'}
      </tr>
    `;

    const siRow = `
      <tr class="bg-gray-50">
        <td class="p-3 font-medium">S.I.</td>
        ${holes.map(h => `<td class="p-3 text-center">${h.handicap || '-'}</td>`).join('')}
        <td></td>
        <td></td>
      </tr>
    `;

    const playerRows = players.map(player => {
      const rowScores = holes.map(hole => {
        const score = player.scores[hole.holeNumber];
        return {
          gross: score?.gross || null,
          points: score?.points ?? null, // Use null coalescing to handle 0
          handicapStrokes: score?.handicapStrokes || 0
        };
      });

      const outTotal = rowScores.reduce((sum, score) => sum + (score.gross || 0), 0);
      const outPoints = rowScores.reduce((sum, score) => sum + (score.points || 0), 0);
      const totalGross = showTotal ? Object.values(player.scores).reduce((sum, score) => sum + (score.gross || 0), 0) : null;
      const totalPoints = showTotal ? Object.values(player.scores).reduce((sum, score) => sum + (score.points || 0), 0) : null;

      return `
        <tr>
          <td class="p-3 font-medium">
            <div class="flex items-center gap-2">
              <span>${player.username}</span>
              ${player.handicap !== undefined && player.handicap !== null ? 
                `<span class="text-sm text-gray-500">(${player.handicap})</span>` : 
                ''}
            </div>
          </td>
          ${rowScores.map(score => `
            <td class="p-3 text-center">
              <div class="flex flex-col items-center">
                <div class="flex items-center gap-1">
                  <span class="font-medium">${score.gross || '-'}</span>
                  ${score.handicapStrokes > 0 ? 
                    `<span class="text-xs text-blue-500">
                      ${'•'.repeat(Math.min(score.handicapStrokes, 3))}
                      ${score.handicapStrokes > 3 ? `(${score.handicapStrokes})` : ''}
                    </span>` : 
                    ''}
                </div>
                ${score.points !== null ? 
                  score.points === 0 ?
                    `<span class="text-xs text-red-500">❌</span>` :
                    `<span class="text-xs text-blue-500">${score.points}p</span>` 
                  : ''}
              </div>
            </td>
          `).join('')}
          <td class="p-3 text-center">
            <div class="flex flex-col items-center">
              <span class="font-bold">${outTotal || '-'}</span>
              ${outPoints ? `<span class="text-xs text-blue-500">${outPoints}p</span>` : ''}
            </div>
          </td>
          ${showTotal ? `
            <td class="p-3 text-center">
              <div class="flex flex-col items-center">
                <span class="font-bold">${totalGross || '-'}</span>
                ${totalPoints ? `<span class="text-xs text-blue-500">${totalPoints}p</span>` : ''}
              </div>
            </td>
          ` : '<td></td>'}
        </tr>
      `;
    }).join('');

    return `
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">${title}</h3>
        <table class="w-full border-collapse" style="table-layout: fixed;">
          ${headerRow}
          ${parRow}
          ${siRow}
          ${playerRows}
        </table>
      </div>
    `;
  };

  const generateImage = async (): Promise<Blob> => {
    // Create hidden div for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    // Split holes into front and back nine
    const frontNine = holes.filter(h => h.holeNumber <= 9);
    const backNine = holes.filter(h => h.holeNumber > 9);

    // Create the scorecard HTML
    container.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-sm" style="width: 1200px;">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">${courseName}</h2>
          <p class="text-xl text-gray-600 mt-2">
            ${date.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        ${createTable(frontNine, 'Front Nine')}
        ${createTable(backNine, 'Back Nine', true)}

        <div class="mt-8 pt-4 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-500">
            Shared from <a href="https://forefun.golf" class="text-blue-500">ForeFun.Golf</a>
          </p>
        </div>
      </div>
    `;

    try {
      // Generate image
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });

      // Clean up
      document.body.removeChild(container);

      // Convert to blob
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
    } catch (error) {
      document.body.removeChild(container);
      throw error;
    }
  };

  const saveToMobileDevice = async (blob: Blob) => {
    const filename = `${courseName.replace(/\s+/g, '-').toLowerCase()}-scorecard.png`;

    // Try using Web Share API first
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${courseName} Scorecard`,
            text: 'Check out my golf round!'
          });
          return true;
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing with Web Share API:', err);
        }
        return false;
      }
    }

    // Fallback to creating a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateImage();
      
      if (isMobile) {
        const success = await saveToMobileDevice(blob);
        if (success) {
          addToast('success', 'Scorecard saved successfully');
          onClose();
        }
      } else {
        // Desktop - Create and trigger download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${courseName.replace(/\s+/g, '-').toLowerCase()}-scorecard.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('success', 'Scorecard downloaded successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error sharing scorecard:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled the share/save
        return;
      }
      addToast('error', 'Failed to save scorecard');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="primary"
      isLoading={isGenerating}
      className="w-full flex items-center justify-center gap-2"
    >
      {isGenerating ? (
        'Generating...'
      ) : (
        <>
          {isMobile ? (
            <Share className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isMobile ? 'Save Image' : 'Download Image'}
        </>
      )}
    </Button>
  );
}