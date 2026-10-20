import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Block, Draft, Outcome, ViewState } from './types';
import { STORAGE_KEY } from './constants';
import { scoreDone } from './logic/engine';
import { HomeScreen } from './components/HomeScreen';
import { TimerScreen } from './components/TimerScreen';
import { DriftScreen } from './components/DriftScreen';
import { CheckScreen } from './components/CheckScreen';
import { StarScreen } from './components/StarScreen';
import { SuggestScreen } from './components/SuggestScreen';
import { JarScreen } from './components/JarScreen';
import { HistoryScreen } from './components/HistoryScreen';

export const App: React.FC = () => {
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.draft) {
          return {
            mode: parsed.draft.mode || 'defining',
            object: parsed.draft.object || '',
            done: parsed.draft.done || '',
            mins: parsed.draft.mins || 30,
          };
        }
      }
    } catch {
      // fallback
    }
    return { mode: 'defining', object: '', done: '', mins: 30 };
  });

  const [active, setActive] = useState<Block | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.active || null;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [log, setLog] = useState<Block[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed.log) ? parsed.log : [];
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [view, setView] = useState<ViewState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.active && parsed.active.endsAt) {
          return { name: Date.now() >= parsed.active.endsAt ? 'check' : 'timer' };
        }
      }
    } catch {
      // fallback
    }
    return { name: 'home' };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          draft,
          active,
          log,
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [draft, active, log]);

  // Audio chime helper
  const playChime = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Note 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.18); // A5
      gain2.gain.setValueAtTime(0.25, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.9);
    } catch {
      // ignore audio context restrictions
    }
  }, [isMuted]);

  // Visibility change listener to advance timer if time is up while away
  const viewRef = useRef(view);
  viewRef.current = view;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const curActive = activeRef.current;
        const curView = viewRef.current;
        if (curActive && curActive.endsAt && Date.now() >= curActive.endsAt && curView.name === 'timer') {
          playChime();
          setView({ name: 'check' });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [playChime]);

  // Block lifecycle actions
  const handleStartBlock = (spec: Draft) => {
    const now = Date.now();
    const newBlock: Block = {
      id: now.toString(36) + Math.random().toString(36).slice(2, 6),
      mode: spec.mode,
      object: String(spec.object || '').trim(),
      done: String(spec.done || '').trim(),
      mins: spec.mins,
      startedAt: now,
      endedAt: now + spec.mins * 60000,
      outcome: null,
      actualMin: 0,
      drifts: [],
      score: scoreDone(spec.done),
    };
    setActive(newBlock);
    setView({ name: 'timer' });
  };

  const handleFinish = (outcome: Outcome) => {
    if (!active) {
      setView({ name: 'home' });
      return;
    }
    const ends = active.endsAt || Date.now();
    const actualMin = Math.max(1, Math.round((Math.min(Date.now(), ends) - active.startedAt) / 60000));
    const rec: Block = {
      ...active,
      endedAt: Date.now(),
      outcome,
      actualMin,
      drifts: active.drifts || [],
      score: scoreDone(active.done),
    };

    setLog((prev) => [...prev, rec]);
    setActive(null);

    if (outcome === 100) {
      setDraft((d) => ({ ...d, object: '', done: '' }));
      setView({ name: 'star', id: rec.id });
    } else if (outcome === 50) {
      setView({ name: 'partly', id: rec.id });
    } else {
      setView({ name: 'missed', id: rec.id });
    }
  };

  const handleLogDrift = (into: string) => {
    if (!active) return;
    const updated: Block = {
      ...active,
      drifts: [...(active.drifts || []), { into, at: Date.now() }],
    };
    setActive(updated);
    setView({ name: 'timer' });
  };

  const handleTimeUp = useCallback(() => {
    playChime();
    setView({ name: 'check' });
  }, [playChime]);

  // Helpers to resolve block for post-timer screens
  const getBlockById = (id?: string): Block | undefined => {
    if (id) {
      const found = log.find((b) => b.id === id);
      if (found) return found;
    }
    return log[log.length - 1];
  };

  return (
    <div id="app" aria-live="polite">
      {view.name === 'home' && (
        <HomeScreen
          draft={draft}
          onUpdateDraft={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
          onStart={handleStartBlock}
          onGoJar={() => setView({ name: 'jar' })}
          hasHistory={log.length > 0}
        />
      )}

      {view.name === 'timer' && active && (
        <TimerScreen
          active={active}
          onDriftClick={() => setView({ name: 'drift' })}
          onEndEarly={() => setView({ name: 'check' })}
          onTimeUp={handleTimeUp}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((m) => !m)}
        />
      )}

      {view.name === 'timer' && !active && (
        <HomeScreen
          draft={draft}
          onUpdateDraft={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
          onStart={handleStartBlock}
          onGoJar={() => setView({ name: 'jar' })}
          hasHistory={log.length > 0}
        />
      )}

      {view.name === 'drift' && active && (
        <DriftScreen
          active={active}
          onLogDrift={handleLogDrift}
          onClose={() => setView({ name: 'timer' })}
        />
      )}

      {view.name === 'check' && active && (
        <CheckScreen active={active} onFinish={handleFinish} />
      )}

      {view.name === 'check' && !active && (
        <HomeScreen
          draft={draft}
          onUpdateDraft={(partial) => setDraft((prev) => ({ ...prev, ...partial }))}
          onStart={handleStartBlock}
          onGoJar={() => setView({ name: 'jar' })}
          hasHistory={log.length > 0}
        />
      )}

      {view.name === 'star' && (
        (() => {
          const block = getBlockById(view.id);
          if (!block) return null;
          return (
            <StarScreen
              block={block}
              onGoJar={() => setView({ name: 'jar' })}
              onNextBlock={() => setView({ name: 'home' })}
            />
          );
        })()
      )}

      {(view.name === 'partly' || view.name === 'missed') && (
        (() => {
          const block = getBlockById(view.id);
          if (!block) return null;
          return (
            <SuggestScreen
              kind={view.name}
              block={block}
              initialIndex={view.i || 0}
              onEdit={(newDraft) => {
                setDraft(newDraft);
                setView({ name: 'home' });
              }}
              onStartThis={(spec) => {
                handleStartBlock(spec);
              }}
            />
          );
        })()
      )}

      {view.name === 'jar' && (
        <JarScreen
          blocks={log}
          initialSelected={view.sel}
          onGoHistory={() => setView({ name: 'history' })}
          onGoHome={() => setView({ name: 'home' })}
        />
      )}

      {view.name === 'history' && (
        <HistoryScreen blocks={log} onBackToJar={() => setView({ name: 'jar' })} />
      )}
    </div>
  );
};
