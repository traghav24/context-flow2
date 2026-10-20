import React, { useState } from 'react';
import { Block, Draft } from '../types';
import { partlySuggestions, missedSuggestions } from '../logic/engine';
import { TagChip } from './Shared';
import { Mascot } from './Mascot';

interface SuggestScreenProps {
  kind: 'partly' | 'missed';
  block: Block;
  initialIndex?: number;
  onEdit: (draft: Draft) => void;
  onStartThis: (spec: Draft) => void;
}

export const SuggestScreen: React.FC<SuggestScreenProps> = ({
  kind,
  block,
  initialIndex = 0,
  onEdit,
  onStartThis,
}) => {
  const suggestions = kind === 'partly' ? partlySuggestions(block) : missedSuggestions(block);
  const [index, setIndex] = useState<number>(initialIndex % suggestions.length);

  const cur = suggestions[index];
  const chips =
    kind === 'partly'
      ? ['one output', 'you can show it', 'countable', `fits ${cur.mins} mins`]
      : ['one output', 'a decision, written down', `fits ${cur.mins} mins`];

  const handleAnother = () => {
    setIndex((prev) => (prev + 1) % suggestions.length);
  };

  const handleEdit = () => {
    onEdit({
      mode: cur.mode,
      object: block.object,
      done: cur.done,
      mins: cur.mins,
    });
  };

  const handleStart = () => {
    onStartThis({
      mode: cur.mode,
      object: block.object,
      done: cur.done,
      mins: cur.mins,
    });
  };

  return (
    <div className="screen" style={{ gap: '14px' }}>
      {/* Mascot header */}
      {kind === 'missed' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Mascot type="starburst-sad" size={68} />
          <div>
            <div style={{ fontSize: '22px', lineHeight: 1.2 }}>
              too big for {block.mins} mins.
              <br />
              that’s okay.
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              let’s unblock you with a tiny decision.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Mascot type="grandma-coach" size={54} />
          <div className="bubble" style={{ fontSize: '13px', lineHeight: 1.35, flex: 1 }}>
            got part-way? your done state was a bit broad. let’s sharpen it!
          </div>
        </div>
      )}

      {/* Broad / Unmade Decision explanation box */}
      <div
        style={{
          background: 'var(--dim)',
          border: '2px solid #000',
          borderRadius: '12px',
          padding: '12px 14px',
        }}
      >
        <div style={{ fontSize: '12px', opacity: 0.8 }}>you wrote</div>
        <div
          className="mono"
          style={{
            fontSize: '16px',
            marginTop: '3px',
            textDecoration: kind === 'partly' ? 'line-through' : 'none',
          }}
        >
          {kind === 'partly' ? block.done : block.object || block.done}
        </div>
        <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.85, lineHeight: 1.4 }}>
          {kind === 'partly'
            ? '↑ a few things bundled together — hard to finish & hard to picture.'
            : '↑ the real snag: there’s a decision you haven’t made yet. you can’t build what you haven’t decided.'}
        </div>
      </div>

      {/* Sharpened / Reframed Suggestion Card */}
      {kind === 'partly' ? (
        <>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span>try this sharper version:</span>
            {cur.rationale && <span style={{ fontSize: '11px', opacity: 0.75 }}>{cur.rationale}</span>}
          </div>
          <div
            style={{
              background: 'var(--yellow)',
              border: '2.5px solid #000',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '4px 4px 0 #000',
            }}
          >
            <div className="mono" style={{ fontSize: '19px', lineHeight: 1.3 }}>
              {cur.done}
            </div>
            <div style={{ marginTop: '10px' }}>
              <TagChip tagKey={cur.mins} height={28} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span>
              so start by <b>defining</b> — one small decision:
            </span>
            {cur.rationale && <span style={{ fontSize: '11px', opacity: 0.75 }}>{cur.rationale}</span>}
          </div>
          <div
            style={{
              background: 'var(--sky)',
              border: '2.5px solid #000',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '4px 4px 0 #000',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '13px' }}>switched to</span>
              <TagChip tagKey="defining" height={26} />
            </div>
            <div className="mono" style={{ fontSize: '19px', lineHeight: 1.3 }}>
              {cur.done}
            </div>
            <div style={{ marginTop: '10px' }}>
              <TagChip tagKey={cur.mins} height={28} />
            </div>
          </div>
        </>
      )}

      {/* 4 Rule verification chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {chips.map((c) => (
          <span key={c} className="rulechip">
            ✓ {c}
          </span>
        ))}
      </div>

      {/* Another suggestion button */}
      <button
        id="another"
        type="button"
        onClick={handleAnother}
        style={{
          background: '#fff',
          border: '2px dashed #000',
          borderRadius: '12px',
          padding: '10px',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        ↻ give me another ({index + 1}/{suggestions.length})
      </button>

      {/* Bottom sticker buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button
          id="edit"
          type="button"
          className="sticker"
          onClick={handleEdit}
          style={{ flex: 1, background: '#fff', fontSize: '15px', borderRadius: '14px' }}
        >
          edit it
        </button>
        <button
          id="startit"
          type="button"
          className="sticker"
          onClick={handleStart}
          style={{ flex: 1.4, background: 'var(--green)', fontSize: '15px', borderRadius: '14px' }}
        >
          start this →
        </button>
      </div>
    </div>
  );
};
