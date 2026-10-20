import React from 'react';
import { Block, Outcome } from '../types';
import { TagImg } from './Shared';
import { Mascot } from './Mascot';

interface CheckScreenProps {
  active: Block;
  onFinish: (outcome: Outcome) => void;
}

export const CheckScreen: React.FC<CheckScreenProps> = ({ active, onFinish }) => {
  const early = Date.now() < active.endsAt!;
  const usedMin = Math.max(1, Math.round((Date.now() - active.startedAt) / 60000));

  const options: {
    outcome: Outcome;
    bg: string;
    pct: string;
    t1: string;
    t2: string;
    badge: 'star-happy' | 'starburst-sad';
  }[] = [
    {
      outcome: 100,
      bg: 'var(--green)',
      pct: '100%',
      t1: 'yep — all of it.',
      t2: 'i earn a star ✦',
      badge: 'star-happy',
    },
    {
      outcome: 50,
      bg: 'var(--yellow)',
      pct: '~50%',
      t1: 'kind of, part-way.',
      t2: 'let’s sharpen it',
      badge: 'starburst-sad',
    },
    {
      outcome: 0,
      bg: 'var(--coral)',
      pct: '0%',
      t1: 'nope, didn’t start it.',
      t2: 'let’s shrink it',
      badge: 'starburst-sad',
    },
  ];

  return (
    <div className="screen" style={{ gap: '16px' }}>
      {/* Grandma Check-in header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Mascot type="grandma-head" size={48} />
        <div className="bubble" style={{ fontSize: '13px', flex: 1 }}>
          no stress dear, honest answers help size your chunks!
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}
      >
        <span>{early ? `stopped early · ${usedMin} of ${active.mins} min` : 'time’s up'}</span>
        <TagImg tagKey={active.mode} height={22} />
        <TagImg tagKey={active.mins} height={22} />
      </div>

      <div style={{ fontSize: '28px', lineHeight: 1.2 }}>
        did you get to
        <br />
        your done state?
      </div>

      <div
        style={{
          background: '#fff',
          border: '2.5px solid #000',
          borderRadius: '14px',
          padding: '12px 14px',
        }}
      >
        <div style={{ fontSize: '12px', opacity: 0.7 }}>you were going for</div>
        <div className="mono" style={{ fontSize: '17px', marginTop: '3px' }}>
          {active.done || '—'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {options.map((opt) => (
          <button
            key={opt.outcome}
            type="button"
            onClick={() => onFinish(opt.outcome)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: opt.bg,
              border: '2.5px solid #000',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '4px 4px 0 #000',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="mono" style={{ fontSize: '26px', minWidth: '64px' }}>
                {opt.pct}
              </span>
              <span style={{ fontSize: '16px', lineHeight: 1.3 }}>
                {opt.t1}
                <br />
                <span style={{ fontSize: '12px', opacity: 0.75 }}>{opt.t2}</span>
              </span>
            </div>
            <Mascot
              type={opt.badge}
              size={36}
              style={{ opacity: opt.outcome === 100 ? 1 : 0.8 }}
            />
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', fontSize: '12px', lineHeight: 1.4, opacity: 0.8 }}>
        honest answers only — this is how we learn to size your chunks. no star for a stretch you
        didn’t make.
      </div>
    </div>
  );
};
