import React, { useState, useEffect } from 'react';
import { Block, Mode } from '../types';
import { MODES } from '../constants';
import { formatTime } from '../logic/engine';
import { TagImg } from './Shared';

interface DriftScreenProps {
  active: Block;
  onLogDrift: (into: string) => void;
  onClose: () => void;
}

export const DriftScreen: React.FC<DriftScreenProps> = ({ active, onLogDrift, onClose }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, active.endsAt! - Date.now()));

  useEffect(() => {
    const tick = () => {
      const left = active.endsAt! - Date.now();
      if (left <= 0) {
        onClose();
      } else {
        setTimeLeft(left);
      }
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [active.endsAt, onClose]);

  return (
    <div
      className="screen"
      style={{
        padding: 0,
        background: 'var(--dim)',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.45,
        }}
      >
        <div className="mono" style={{ fontSize: '76px', color: 'var(--timer)' }}>
          {formatTime(timeLeft)}
        </div>
        <div style={{ fontSize: '14px', marginTop: '6px' }}>still ticking…</div>
      </div>

      <div
        style={{
          background: 'var(--bg)',
          borderTop: '3px solid #000',
          borderRadius: '26px 26px 0 0',
          padding: '26px 24px calc(30px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '5px',
            borderRadius: '3px',
            background: '#000',
            alignSelf: 'center',
            opacity: 0.35,
          }}
        />
        <div style={{ fontSize: '21px', lineHeight: 1.4 }}>
          drifted off? no stress.
          <br />
          what did your head wander into?
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onLogDrift(mode)}
              aria-label={mode}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <TagImg tagKey={mode} height={44} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => onLogDrift('somewhere else')}
            style={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '10px',
              padding: '8px 14px',
              fontFamily: "'Anonymous Pro', monospace",
              fontWeight: 700,
              fontSize: '17px',
              cursor: 'pointer',
            }}
          >
            somewhere else
          </button>
        </div>

        <div style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.75 }}>
          tap one — we note it and drop you straight back on the clock. no scolding, just a nudge
          home.
        </div>
      </div>
    </div>
  );
};
