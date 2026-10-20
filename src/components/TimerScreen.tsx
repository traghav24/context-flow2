import React, { useState, useEffect } from 'react';
import { Block } from '../types';
import { formatTime } from '../logic/engine';
import { ArcLabel, TagImg } from './Shared';
import { Mascot } from './Mascot';

interface TimerScreenProps {
  active: Block;
  onDriftClick: () => void;
  onEndEarly: () => void;
  onTimeUp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({
  active,
  onDriftClick,
  onEndEarly,
  onTimeUp,
  isMuted,
  onToggleMute,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => Math.max(0, active.endsAt! - Date.now()));

  useEffect(() => {
    const tick = () => {
      const left = active.endsAt! - Date.now();
      if (left <= 0) {
        setTimeLeft(0);
        onTimeUp();
      } else {
        setTimeLeft(left);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [active.endsAt, onTimeUp]);

  const totalTime = active.endsAt! - active.startedAt;
  const progressPercent = Math.min(100, Math.max(0, (1 - timeLeft / totalTime) * 100));

  const driftCount = (active.drifts || []).length;
  const lastDrift = driftCount > 0 ? active.drifts[driftCount - 1].into : null;

  return (
    <div className="screen" style={{ alignItems: 'center', gap: 0 }}>
      {/* Top Bar with Mute */}
      <button
        id="mute"
        type="button"
        onClick={onToggleMute}
        aria-label="mute"
        style={{
          alignSelf: 'flex-end',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #000',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isMuted ? 0.4 : 1,
          cursor: 'pointer',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H2v6h4l5 4z" />
          {isMuted ? (
            <>
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : (
            <>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </>
          )}
        </svg>
      </button>

      {/* Grandma reading to dog mascot */}
      <Mascot type="grandma-dog" size={132} style={{ marginTop: '4px' }} />

      <div
        style={{
          maxWidth: '250px',
          textAlign: 'center',
          fontSize: '15px',
          lineHeight: 1.5,
          marginTop: '6px',
        }}
      >
        i’m just gonna read my dog a lil story while you finish your work
      </div>

      {/* Giant Clock */}
      <div
        id="clock"
        className="mono"
        style={{
          fontSize: '96px',
          color: 'var(--timer)',
          letterSpacing: '2px',
          marginTop: '22px',
          textShadow: '3px 3px 0 rgba(0,0,0,.25)',
        }}
      >
        {formatTime(timeLeft)}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '14px',
          background: 'var(--dim)',
          border: '2px solid #000',
          borderRadius: '8px',
          overflow: 'hidden',
          marginTop: '6px',
        }}
      >
        <div
          id="bar"
          style={{
            height: '100%',
            background: 'var(--green)',
            width: `${progressPercent.toFixed(1)}%`,
            transition: 'width 0.25s linear',
          }}
        />
      </div>

      {/* Target Done State */}
      <div style={{ marginTop: '26px', textAlign: 'center', fontSize: '17px', lineHeight: 1.5 }}>
        until you have
        <br />
        <span className="mono" style={{ fontSize: '19px' }}>
          {active.done || '—'}
        </span>
      </div>

      {/* Tags */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '9px', alignItems: 'center' }}>
        <TagImg tagKey={active.mode} height={28} />
        <TagImg tagKey={active.mins} height={28} />
      </div>

      {/* Drift Log Text */}
      <div
        id="log"
        className="mono"
        style={{
          fontSize: '12px',
          marginTop: '8px',
          opacity: 0.75,
          color: '#1a1a1a',
          minHeight: '14px',
        }}
      >
        {driftCount > 0 ? `${driftCount} drift${driftCount > 1 ? 's' : ''} · last: ${lastDrift}` : ''}
      </div>

      {/* Bottom Character Sticker Buttons */}
      <div style={{ marginTop: 'auto', position: 'relative', width: '100%', height: '176px' }}>
        <button
          id="drift"
          type="button"
          onClick={onDriftClick}
          aria-label="log a drift"
          style={{
            position: 'absolute',
            left: 0,
            top: '14px',
            width: '132px',
            height: '124px',
            cursor: 'pointer',
          }}
        >
          <Mascot type="starburst-sad" size={120} />
          <div style={{ position: 'absolute', left: '-14px', bottom: '-22px' }}>
            <ArcLabel id="arcD" text="log a drift" d="M 6 20 Q 76 36 146 20" width={152} />
          </div>
        </button>

        <button
          id="end"
          type="button"
          onClick={onEndEarly}
          aria-label="end early"
          style={{
            position: 'absolute',
            right: '4px',
            bottom: 0,
            width: '132px',
            height: '120px',
            cursor: 'pointer',
          }}
        >
          <Mascot type="star-happy" size={120} />
          <div style={{ position: 'absolute', right: '-6px', top: '-24px' }}>
            <ArcLabel id="arcE" text="end early" d="M 6 28 Q 68 10 132 26" width={138} />
          </div>
        </button>
      </div>
    </div>
  );
};
