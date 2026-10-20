import React, { useState } from 'react';
import { Block } from '../types';
import { Mascot } from './Mascot';

interface JarScreenProps {
  blocks: Block[];
  initialSelected?: number;
  onGoHistory: () => void;
  onGoHome: () => void;
}

export const JarScreen: React.FC<JarScreenProps> = ({
  blocks,
  initialSelected,
  onGoHistory,
  onGoHome,
}) => {
  const earned = blocks.filter((b) => b.outcome === 100);
  const [selectedIdx, setSelectedIdx] = useState<number>(
    initialSelected != null
      ? initialSelected
      : Math.max(0, earned.length - 1)
  );

  const totalSlots = Math.max(9, Math.ceil(earned.length / 3) * 3);
  const selectedBlock = earned[selectedIdx];

  return (
    <div className="screen" style={{ gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '28px' }}>your star jar</div>
        <button
          type="button"
          onClick={onGoHistory}
          style={{
            fontSize: '13px',
            borderBottom: '2px solid #000',
            cursor: 'pointer',
            paddingBottom: '2px',
          }}
        >
          history →
        </button>
      </div>

      <div style={{ fontSize: '14px', opacity: 0.85 }}>
        {earned.length} clean chunk{earned.length === 1 ? '' : 's'} shipped. each one, a done state
        you actually finished.
      </div>

      {/* Grid of Stars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '4px',
        }}
      >
        {Array.from({ length: totalSlots }).map((_, k) => {
          if (k < earned.length) {
            const isSelected = k === selectedIdx;
            return (
              <button
                key={earned[k].id}
                type="button"
                onClick={() => setSelectedIdx(k)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  cursor: 'pointer',
                  border: isSelected ? '2.5px solid #000' : '2px solid transparent',
                  background: isSelected ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                  transform: isSelected ? 'scale(1.04)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Mascot type="star-happy" size={70} />
              </button>
            );
          }
          return (
            <div
              key={`empty-${k}`}
              style={{
                aspectRatio: '1',
                border: '2px dashed #000',
                opacity: 0.4,
                borderRadius: '14px',
              }}
            />
          );
        })}
      </div>

      {/* Selected Star Details or Empty Jar Message */}
      <div
        style={{
          marginTop: 'auto',
          background: '#fff',
          border: '2.5px solid #000',
          borderRadius: '16px',
          padding: '14px 16px',
        }}
      >
        {selectedBlock ? (
          <>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              star #{selectedIdx + 1} — you shipped
            </div>
            <div className="mono" style={{ fontSize: '17px', marginTop: '4px' }}>
              {selectedBlock.done}
            </div>
            <div
              className="mono"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                fontSize: '13px',
              }}
            >
              <span>
                planned <b>{selectedBlock.mins}m</b>
              </span>
              <span>
                took <b>{selectedBlock.actualMin}m</b>
              </span>
              <span>{selectedBlock.mode}</span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mascot type="grandma-head" size={44} />
            <div style={{ fontSize: '14px', opacity: 0.85, lineHeight: 1.35 }}>
              no stars yet — finish a block at 100% and your first star lands right here!
            </div>
          </div>
        )}
      </div>

      <button
        id="name"
        type="button"
        className="sticker"
        onClick={onGoHome}
        style={{ background: 'var(--green)', fontSize: '17px', borderRadius: '14px' }}
      >
        name a block →
      </button>
    </div>
  );
};
