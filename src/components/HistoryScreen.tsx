import React from 'react';
import { Block } from '../types';
import { dots, scoreDone } from '../logic/engine';
import { Mascot } from './Mascot';

interface HistoryScreenProps {
  blocks: Block[];
  onBackToJar: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ blocks, onBackToJar }) => {
  const all = [...blocks].reverse();
  const done = blocks.filter((b) => b.outcome != null);
  const hundo = done.filter((b) => b.outcome === 100).length;
  const rate = done.length ? Math.round((100 * hundo) / done.length) : 0;
  const offs = done.map((b) => Math.abs(b.actualMin - b.mins));
  const avgOff = offs.length
    ? Math.round(offs.reduce((a, b) => a + b, 0) / offs.length)
    : 0;

  return (
    <div className="screen" style={{ gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '26px', lineHeight: 1.2 }}>
          how’s your
          <br />
          breaking-down?
        </div>
        <button
          type="button"
          onClick={onBackToJar}
          style={{
            fontSize: '13px',
            borderBottom: '2px solid #000',
            cursor: 'pointer',
            paddingBottom: '2px',
          }}
        >
          ← jar
        </button>
      </div>

      {/* Two summary cards */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div
          style={{
            flex: 1,
            background: 'var(--green)',
            border: '2.5px solid #000',
            borderRadius: '14px',
            padding: '12px',
          }}
        >
          <div className="mono" style={{ fontSize: '26px' }}>
            {rate}%
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.3 }}>of chunks hit 100%</div>
        </div>
        <div
          style={{
            flex: 1,
            background: 'var(--yellow)',
            border: '2.5px solid #000',
            borderRadius: '14px',
            padding: '12px',
          }}
        >
          <div className="mono" style={{ fontSize: '26px' }}>
            ±{avgOff}m
          </div>
          <div style={{ fontSize: '12px', lineHeight: 1.3 }}>your time guess is off by</div>
        </div>
      </div>

      {/* Explanation with Grandma Coach */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Mascot type="grandma-coach" size={44} />
        <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.45, flex: 1 }}>
          sharper done states = closer guesses. the 4 dots show how well each was broken down
          (one output · showable · countable · fits the timer).
        </div>
      </div>

      {/* Rows of logged blocks */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          maxHeight: '430px',
        }}
      >
        {all.length > 0 ? (
          all.map((b) => {
            const act =
              b.outcome === 100
                ? `${b.actualMin}m`
                : b.outcome === 50
                ? 'part'
                : '—';
            const blockScore = b.score || scoreDone(b.done);

            return (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  border: '2px solid #000',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {b.done || b.object || '—'}
                  </div>
                  <div className="mono" style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                    {b.mins}m → {act} · {b.mode}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: '15px',
                    letterSpacing: '2px',
                    flexShrink: 0,
                    color: blockScore === 4 ? '#107a2a' : '#000',
                  }}
                  title={`${blockScore}/4 breakdown score`}
                >
                  {dots(blockScore)}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: '14px', opacity: 0.8 }}>nothing logged yet.</div>
        )}
      </div>
    </div>
  );
};
