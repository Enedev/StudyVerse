import { useQueryClient } from '@tanstack/react-query';
import { Eraser, Highlighter, MousePointer2, PenLine, Type } from 'lucide-react';
import { useState, type PointerEvent } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { createAnnotation, deleteAnnotation } from './documents-api';
import type { DocumentAnnotation } from './document-types';

type Tool = 'select' | 'pen' | 'highlight' | 'text' | 'eraser';
type Point = { x: number; y: number };

type PdfMarkupProps = {
  documentId: string;
  pageNumber: number;
  annotations: DocumentAnnotation[];
};

function pointsOf(annotation: DocumentAnnotation) {
  const geometry = annotation.geometry as { points?: Point[] } | null;
  return geometry?.points ?? [];
}

function strokeColor(annotation: DocumentAnnotation) {
  return annotation.annotationType === 'highlight' ? '#f5d90a' : '#1f2937';
}

export function PdfMarkup({ documentId, pageNumber, annotations }: PdfMarkupProps) {
  const queryClient = useQueryClient();
  const [tool, setTool] = useState<Tool>('select');
  const [draft, setDraft] = useState<Point[]>([]);
  const [textDraft, setTextDraft] = useState<{ x: number; y: number; value: string } | null>(
    null,
  );
  const marks = annotations.filter(
    (annotation) =>
      annotation.pageNumber === pageNumber &&
      (annotation.annotationType === 'drawing' ||
        annotation.annotationType === 'highlight' ||
        annotation.annotationType === 'text'),
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['annotations', documentId] });

  const locate = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const finishStroke = async () => {
    if (draft.length < 2 || (tool !== 'pen' && tool !== 'highlight')) {
      setDraft([]);
      return;
    }
    const annotationType = tool === 'highlight' ? 'highlight' : 'drawing';
    await createAnnotation(documentId, {
      annotationType,
      pageNumber,
      color: annotationType === 'highlight' ? '#F5D90A' : '#1F2937',
      geometry: { points: draft },
    });
    setDraft([]);
    await refresh();
  };

  const saveText = async () => {
    if (!textDraft?.value.trim()) {
      setTextDraft(null);
      return;
    }
    await createAnnotation(documentId, {
      annotationType: 'text',
      pageNumber,
      content: textDraft.value.trim(),
      color: '#1F2937',
      geometry: { x: textDraft.x, y: textDraft.y },
    });
    setTextDraft(null);
    await refresh();
  };

  return (
    <>
      <div className="bg-card/95 pointer-events-auto absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full border p-1 shadow-lg">
        {(
          [
            ['select', MousePointer2, 'Move'],
            ['pen', PenLine, 'Pen'],
            ['highlight', Highlighter, 'Highlight'],
            ['text', Type, 'Text'],
            ['eraser', Eraser, 'Eraser'],
          ] as const
        ).map(([value, Icon, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={tool === value ? 'default' : 'ghost'}
            aria-label={label}
            onClick={() => setTool(value)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>
      <svg
        className={cn(
          'absolute inset-0 z-10 h-full w-full',
          tool === 'select' ? 'pointer-events-none' : 'cursor-crosshair',
        )}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onPointerDown={(event) => {
          if (tool === 'pen' || tool === 'highlight') {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDraft([locate(event)]);
          }
          if (tool === 'text') {
            const point = locate(event);
            setTextDraft({ x: point.x, y: point.y, value: '' });
          }
        }}
        onPointerMove={(event) => {
          if (draft.length === 0 || event.buttons === 0) return;
          setDraft((current) => [...current, locate(event)]);
        }}
        onPointerUp={() => void finishStroke()}
      >
        {marks.map((annotation) => {
          if (annotation.annotationType === 'text') {
            const position = annotation.geometry as { x?: number; y?: number } | null;
            return (
              <text
                key={annotation.id}
                x={`${(position?.x ?? 0) * 100}`}
                y={`${(position?.y ?? 0) * 100}`}
                fill="#1f2937"
                fontSize="3.2"
                className={tool === 'eraser' ? 'cursor-pointer' : undefined}
                onPointerDown={(event) => {
                  if (tool !== 'eraser') return;
                  event.stopPropagation();
                  void deleteAnnotation(documentId, annotation.id).then(refresh);
                }}
              >
                {annotation.content}
              </text>
            );
          }
          const points = pointsOf(annotation)
            .map((point) => `${point.x * 100},${point.y * 100}`)
            .join(' ');
          return (
            <polyline
              key={annotation.id}
              points={points}
              fill="none"
              stroke={strokeColor(annotation)}
              strokeWidth={annotation.annotationType === 'highlight' ? 4 : 0.8}
              strokeOpacity={annotation.annotationType === 'highlight' ? 0.45 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={tool === 'eraser' ? 'cursor-pointer' : undefined}
              onPointerDown={(event) => {
                if (tool !== 'eraser') return;
                event.stopPropagation();
                void deleteAnnotation(documentId, annotation.id).then(refresh);
              }}
            />
          );
        })}
        {draft.length > 1 && (
          <polyline
            points={draft.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')}
            fill="none"
            stroke={tool === 'highlight' ? '#f5d90a' : '#1f2937'}
            strokeWidth={tool === 'highlight' ? 4 : 0.8}
            strokeOpacity={tool === 'highlight' ? 0.45 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {textDraft && (
        <input
          autoFocus
          className="absolute z-20 rounded border bg-white px-2 py-1 text-sm text-black shadow"
          style={{ left: `${textDraft.x * 100}%`, top: `${textDraft.y * 100}%` }}
          value={textDraft.value}
          onChange={(event) =>
            setTextDraft((current) =>
              current ? { ...current, value: event.target.value } : current,
            )
          }
          onBlur={() => void saveText()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void saveText();
          }}
        />
      )}
    </>
  );
}
