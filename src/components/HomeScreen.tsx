import React, { useState, useRef, useMemo } from 'react';
import { Draft } from '../types';
import { MODES, MINS } from '../constants';
import { TagImg } from './Shared';
import { Mascot } from './Mascot';
import { gradeDoneState, dots, getSmartSimplificationsForInput } from '../logic/engine';

interface HomeScreenProps {
  draft: Draft;
  onUpdateDraft: (partial: Partial<Draft>) => void;
  onStart: (spec: Draft) => void;
  onGoJar: () => void;
  hasHistory: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  draft,
  onUpdateDraft,
  onStart,
  onGoJar,
  hasHistory,
}) => {
  const [modePopKey, setModePopKey] = useState(0);
  const [minsPopKey, setMinsPopKey] = useState(0);
  const [showHelper, setShowHelper] = useState(false);
  const doneInputRef = useRef<HTMLInputElement>(null);

  const canStart = Boolean(draft.object.trim() && draft.done.trim());

  // Grade the done state in real time
  const grade = useMemo(() => {
    return gradeDoneState({
      mode: draft.mode,
      object: draft.object,
      done: draft.done,
      mins: draft.mins,
    });
  }, [draft.mode, draft.object, draft.done, draft.mins]);

  // Dynamic grandma message based on coaching feedback
  const grandmaMessage = useMemo(() => {
    if (!draft.done.trim()) {
      return 'you can do this!!';
    }
    if (grade.score === 4) {
      return 'yes! that is a crisp, clean chunk ✦';
    }
    if (grade.tip) {
      return grade.tip;
    }
    return 'keep it small and showable, dear!';
  }, [draft.done, grade]);

  // Smart suggestions tailored to current object & mode
  const quickSuggestions = useMemo(() => {
    return getSmartSimplificationsForInput(draft.object, draft.mode, draft.mins);
  }, [draft.object, draft.mode, draft.mins]);

  const handleNextMode = () => {
    const nextIdx = (MODES.indexOf(draft.mode) + 1) % MODES.length;
    onUpdateDraft({ mode: MODES[nextIdx] });
    setModePopKey((k) => k + 1);
  };

  const handleNextMins = () => {
    const nextIdx = (MINS.indexOf(draft.mins) + 1) % MINS.length;
    onUpdateDraft({ mins: MINS[nextIdx] });
    setMinsPopKey((k) => k + 1);
  };

  const handleStart = () => {
    if (!canStart) return;
    onStart(draft);
  };

  const handleApplySuggestion = (sugDone: string, sugMins?: number) => {
    onUpdateDraft({
      done: sugDone,
      ...(sugMins ? { mins: sugMins as Draft['mins'] } : {}),
    });
    setShowHelper(false);
  };

  return (
    <div className="screen" style={{ gap: '16px' }}>
      {/* Grandma Mascot Header with dynamic speech bubble */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
          <Mascot
            type={grade.score < 4 && draft.done.trim() ? 'grandma-coach' : 'grandma-head'}
            size={64}
            alt="grandma coach"
          />
          <div
            className="bubble"
            style={{
              marginTop: '6px',
              fontSize: '14px',
              lineHeight: 1.35,
              background: grade.score === 4 && draft.done.trim() ? 'var(--green)' : '#fff',
              transition: 'background 0.2s ease',
            }}
          >
            {grandmaMessage}
          </div>
        </div>

        {hasHistory && (
          <button
            type="button"
            onClick={onGoJar}
            style={{
              fontSize: '13px',
              borderBottom: '2px solid #000',
              paddingBottom: '2px',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: '8px',
            }}
          >
            jar ✦
          </button>
        )}
      </div>

      {/* Mode Selector */}
      <div style={{ marginTop: '2px' }}>
        <div className="label" style={{ fontSize: '22px' }}>
          i am{' '}
          <button
            type="button"
            onClick={handleNextMode}
            aria-label={`mode: ${draft.mode}, tap to change`}
            style={{ verticalAlign: 'middle', outline: 'none' }}
          >
            <span key={modePopKey} className="pop" style={{ display: 'inline-block' }}>
              <TagImg tagKey={draft.mode} height={36} />
            </span>
          </button>
        </div>
      </div>

      {/* Tiny Thing Object Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="label" htmlFor="obj">
          the tiny thing
        </label>
        <input
          id="obj"
          className="field"
          type="text"
          placeholder="the after-timer screens"
          value={draft.object}
          onChange={(e) => onUpdateDraft({ object: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              doneInputRef.current?.focus();
            }
          }}
        />
      </div>

      {/* Done State Input with Live Breakdown Scoring */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="label" htmlFor="done">
            until i have
          </label>
          {draft.done.trim() && (
            <div
              className="mono"
              style={{
                fontSize: '13px',
                letterSpacing: '2px',
                color: grade.score === 4 ? '#107a2a' : '#222',
              }}
              title={`Done-state score: ${grade.score}/4`}
            >
              {dots(grade.score)}
            </div>
          )}
        </div>

        <input
          id="done"
          ref={doneInputRef}
          className="field"
          type="text"
          placeholder="a list of the 3 screens i need"
          value={draft.done}
          onChange={(e) => onUpdateDraft({ done: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canStart) {
              handleStart();
            }
          }}
          style={{
            borderColor:
              draft.done.trim() && grade.score < 3
                ? '#e05a47'
                : draft.done.trim() && grade.score === 4
                ? '#2a8b3e'
                : '#000',
          }}
        />

        {/* Clean Chunk Feedback Bar */}
        {draft.done.trim() && grade.score === 4 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
            <span
              style={{
                fontSize: '12px',
                color: '#126e2e',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>✓</span> clean chunk · fits {draft.mins} mins
            </span>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>4/4 criteria passed</span>
          </div>
        )}

        {/* Smart Simplifier Helper Bar for Broad or Incomplete Done States */}
        {draft.object.trim() && (!draft.done.trim() || grade.score < 4) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
            <button
              type="button"
              onClick={() => setShowHelper((v) => !v)}
              style={{
                fontSize: '12px',
                background: 'var(--yellow)',
                border: '1.5px solid #000',
                borderRadius: '8px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily: "'Anonymous Pro', monospace",
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>💡</span>
              {showHelper ? 'hide ideas' : 'need ideas?'}
            </button>
            <span style={{ fontSize: '11px', color: '#b33827', fontWeight: 600 }}>
              {grade.tip || 'needs a sharper target'}
            </span>
          </div>
        )}

        {/* Expanded Smart Suggestions Tray */}
        {showHelper && (
          <div
            style={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>
              TAP TO USE A SHARP DONE STATE:
            </div>
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySuggestion(s.done, s.mins)}
                style={{
                  textAlign: 'left',
                  background: 'var(--sky)',
                  border: '1.5px solid #000',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  fontFamily: "'Anonymous Pro', monospace",
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{s.done}</span>
                <span
                  style={{
                    fontSize: '10px',
                    background: '#fff',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    border: '1px solid #000',
                  }}
                >
                  {s.mins}m
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duration Selector */}
      <div>
        <div className="label">
          for{' '}
          <button
            type="button"
            onClick={handleNextMins}
            aria-label="duration, tap to change"
            style={{ verticalAlign: 'middle', outline: 'none' }}
          >
            <span key={minsPopKey} className="pop" style={{ display: 'inline-block' }}>
              <TagImg tagKey={draft.mins} height={36} />
            </span>
          </button>
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        className="sticker"
        onClick={handleStart}
        disabled={!canStart}
        style={{
          marginTop: 'auto',
          background: 'var(--green)',
          fontSize: '22px',
          borderRadius: '16px',
          opacity: canStart ? 1 : 0.5,
          cursor: canStart ? 'pointer' : 'not-allowed',
        }}
      >
        start the timer →
      </button>
    </div>
  );
};
