export type Mode = 'defining' | 'exploring' | 'creating' | 'critiquing' | 'communicating';

export type Duration = 15 | 30 | 45;

export type Outcome = 100 | 50 | 0;

export interface Drift {
  into: string;
  at: number;
}

export interface Block {
  id: string;
  mode: Mode;
  object: string;
  done: string;
  mins: Duration;
  startedAt: number;
  endsAt?: number;
  endedAt: number | null;
  outcome: Outcome | null;
  actualMin: number;
  drifts: Drift[];
  score: number;
}

export interface Draft {
  mode: Mode;
  object: string;
  done: string;
  mins: Duration;
}

export interface Suggestion {
  mode: Mode;
  object?: string;
  done: string;
  mins: Duration;
  rulesPassed: string[];
  rationale?: string;
}

export type ScreenName =
  | 'home'
  | 'timer'
  | 'drift'
  | 'check'
  | 'star'
  | 'partly'
  | 'missed'
  | 'jar'
  | 'history';

export interface ViewState {
  name: ScreenName;
  id?: string;
  i?: number;
  sel?: number;
}
