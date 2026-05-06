import { useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import type { AppState, Lang, Stamp } from '@/lib/types';

interface Props {
  state: AppState;
  lang: Lang;
  onDeleteStamp: (id: string) => void;
  onDragStamp: (id: string, x: number, y: number) => void;
  newStampId?: string;
}

export default function PassportStamps({ state, lang, onDeleteStamp, onDragStamp, newStampId }: Props) {
  const { stamps, theme } = state;

  return (
    <div style={{ display: 'flex', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Left page */}
      <StampPage
        stamps={stamps.slice(0, Math.ceil(stamps.length / 2))}
        lang={lang}
        theme={theme}
        onDeleteStamp={onDeleteStamp}
        onDragStamp={onDragStamp}
        pageLabel="VISAS"
        isEmpty={stamps.length === 0}
        newStampId={newStampId}
      />

      {/* Spine */}
      <div style={{ width: 10, background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 100%)', flexShrink: 0 }} />

      {/* Right page */}
      <StampPage
        stamps={stamps.slice(Math.ceil(stamps.length / 2))}
        lang={lang}
        theme={theme}
        onDeleteStamp={onDeleteStamp}
        onDragStamp={onDragStamp}
        pageLabel="VISAS"
        isEmpty={false}
        hideEmpty
        newStampId={newStampId}
      />
    </div>
  );
}

interface StampPageProps {
  stamps: Stamp[];
  lang: Lang;
  theme: string;
  onDeleteStamp: (id: string) => void;
  onDragStamp: (id: string, x: number, y: number) => void;
  pageLabel: string;
  isEmpty: boolean;
  hideEmpty?: boolean;
  newStampId?: string;
}

function StampPage({ stamps, lang, theme, onDeleteStamp, onDragStamp, isEmpty, hideEmpty, newStampId }: StampPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      width: 330,
      minHeight: 480,
      background: '#fffef8',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* VISAS watermark background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <span style={{
          fontFamily: "'Black Han Sans', sans-serif",
          fontSize: 80,
          color: 'rgba(0,0,0,0.04)',
          letterSpacing: '0.1em',
          userSelect: 'none',
        }}>
          VISAS
        </span>
      </div>

      {/* Watermark text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: 8,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          transform: 'rotate(-35deg)',
          transformOrigin: 'left bottom',
          fontSize: 7,
          fontWeight: 700,
          color: 'rgba(0,0,0,0.04)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}>
          NOT AN OFFICIAL DOCUMENT · KIDS PLAY PASSPORT · NOT AN OFFICIAL DOCUMENT
        </div>
      </div>

      {/* Line pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.04) 28px, rgba(0,0,0,0.04) 29px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Page header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 26,
        background: `var(--theme-passport-cover, #1a3a6b)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)' }}>
          STAMPS & VISAS
        </span>
      </div>

      {/* Stamps container */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 26, zIndex: 1 }}>
        {stamps.map(stamp => (
          <StampItem
            key={stamp.id}
            stamp={stamp}
            onDelete={() => onDeleteStamp(stamp.id)}
            onDragUpdate={onDragStamp}
            containerRef={containerRef}
            isNew={stamp.id === newStampId}
          />
        ))}
      </div>

      {/* Empty state */}
      {isEmpty && !hideEmpty && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          zIndex: 2,
          pointerEvents: 'none',
          padding: 24,
        }}>
          <div style={{ fontSize: 48 }}>✈️</div>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#aaa',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {t(lang, 'noStamps')}
          </div>
          <div style={{
            fontSize: 12,
            color: '#bbb',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {t(lang, 'noStampsSub')}
          </div>
        </div>
      )}
    </div>
  );
}

interface StampItemProps {
  stamp: Stamp;
  onDelete: () => void;
  onDragUpdate: (id: string, x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isNew?: boolean;
}

function StampItem({ stamp, onDelete, onDragUpdate, containerRef, isNew }: StampItemProps) {
  const { emoji, image, place, date, x, y, rotation, color } = stamp;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ px: number; py: number; sx: number; sy: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('.stamp-delete-btn')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = { px: e.clientX, py: e.clientY, sx: x, sy: y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.px;
    const dy = e.clientY - dragStartRef.current.py;
    const newX = Math.max(5, Math.min(95, dragStartRef.current.sx + (dx / rect.width) * 100));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.sy + (dy / rect.height) * 100));
    onDragUpdate(stamp.id, newX, newY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div
      data-testid={`stamp-item-${stamp.id}`}
      className={`stamp-item${isNew ? ' new-stamp' : ''}${isDragging ? ' dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        '--r': `${rotation}deg`,
        color: color,
        zIndex: isDragging ? 10 : 2,
        touchAction: 'none',
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="stamp-circle" style={{ borderColor: color, boxShadow: `inset 0 0 0 2px ${color}` }}>
        {image ? (
          <img
            src={image}
            alt={place}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div className="stamp-emoji">{emoji}</div>
        )}
        <div className="stamp-place" style={{ color, fontSize: 7, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {place}
        </div>

        <button
          data-testid={`btn-delete-stamp-${stamp.id}`}
          className="stamp-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete stamp"
          title="Delete stamp"
        >
          ×
        </button>
      </div>

      <div className="stamp-date" style={{ color, fontSize: 7, fontFamily: 'monospace', marginTop: 2 }}>
        {date ? formatDate(date) : ''}
      </div>
    </div>
  );
}
