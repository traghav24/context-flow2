import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Block } from '../types';
import { Mascot } from './Mascot';

interface StarScreenProps {
  block: Block;
  onGoJar: () => void;
  onNextBlock: () => void;
}

export const StarScreen: React.FC<StarScreenProps> = ({ block, onGoJar, onNextBlock }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffe063', '#cafba2', '#ffffff', '#e8c1ff'],
      });
    } catch {
      // ignore in environments without canvas
    }
  }, []);

  return (
    <div className="screen" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div
        style={{
          fontSize: '13px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginTop: '4px',
        }}
      >
        you shipped it ✦
      </div>

      <div style={{ position: 'relative', marginTop: '28px' }}>
        <Mascot type="star-happy" size={170} className="pop" />
        <div style={{ position: 'absolute', bottom: '-8px', right: '-12px' }}>
          <Mascot type="grandma-proud" size={54} />
        </div>
      </div>

      <div style={{ fontSize: '27px', lineHeight: 1.25, marginTop: '24px' }}>
        that’s a clean chunk.
        <br />
        star in the jar.
      </div>

      <div
        style={{
          background: '#fff',
          border: '2.5px solid #000',
          borderRadius: '16px',
          padding: '16px 18px',
          marginTop: '22px',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: '13px', opacity: 0.7 }}>you shipped</div>
        <div className="mono" style={{ fontSize: '18px', marginTop: '4px' }}>
          {block.done}
        </div>
        <div
          className="mono"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '14px',
            fontSize: '14px',
          }}
        >
          <span>
            planned <b>{block.mins}m</b>
          </span>
          <span>
            took <b>{block.actualMin}m</b>
          </span>
          <span>{block.mode}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', width: '100%' }}>
        <button
          id="jar"
          type="button"
          className="sticker"
          onClick={onGoJar}
          style={{ flex: 1, background: '#fff', fontSize: '15px', borderRadius: '14px' }}
        >
          see my jar
        </button>
        <button
          id="next"
          type="button"
          className="sticker"
          onClick={onNextBlock}
          style={{ flex: 1, background: 'var(--green)', fontSize: '15px', borderRadius: '14px' }}
        >
          next block →
        </button>
      </div>
    </div>
  );
};
