import { Block, Suggestion, Mode, Duration } from '../types';

export const VAGUE_WORDS =
  /\b(work|progress|stuff|things?|better|improve|some|a bit|finish( up)?|the (whole )?(thing|project|flow|design|deck|app|page|codebase)|everything|clean up|do|handle)\b/i;

export interface GradeResult {
  score: 1 | 2 | 3 | 4;
  rules: {
    one_output: boolean;
    showable: boolean;
    countable: boolean;
    fits_timer: boolean;
  };
  tip?: string;
}

/**
 * Grade a done state against the 4 Context Flow rules (§2 of brief):
 * 1. one_output: single artifact, no conjunctions of separate deliverables
 * 2. showable: concrete artifact you could screenshot or point at, not vague state
 * 3. countable: has a number or explicit single edge
 * 4. fits_timer: realistically finishable in the chosen minutes
 */
export function gradeDoneState(spec: {
  mode?: Mode;
  object?: string;
  done?: string;
  mins?: Duration;
}): GradeResult {
  const d = String(spec.done || '').trim();
  const mins = spec.mins || 30;

  if (!d) {
    return {
      score: 1,
      rules: { one_output: false, showable: false, countable: false, fits_timer: false },
      tip: 'name 1 concrete thing you can screenshot or point at',
    };
  }

  // Concrete artifacts that are inherently tangible and showable
  const concreteArtifacts =
    /\b(pin|pins|photo|photos|image|images|pic|pics|picture|pictures|link|links|screen|screens|list|bullet|bullets|draft|card|cards|button|buttons|form|forms|page|pages|doc|docs|email|emails|schema|wireframe|wireframes|mockup|mockups|table|sentence|sentences|paragraph|paragraphs|notes?|heading|diagram|spec|component|components|item|items|quote|quotes|decision|outline|sketch|assets?|board)\b/i;

  // Rule 1: one_output
  // Flags conjunctions of distinct deliverables (e.g., "landing page and docs", "header + footer", "code and tests")
  // Does NOT flag natural descriptive prepositions like "pins from pinterest for moodboard"
  const hasConjunctionOfDeliverables =
    /\b(and\s+(also|then|additionally|write|build|design|create|make|code)|as well as|\+|&)\b/i.test(
      d
    ) ||
    /,\s*(and|\w+)/i.test(d) ||
    /\b\w+\s+and\s+\w+\s+(done|finished|shipped)\b/i.test(d);

  // If there's an "and" joining two distinct artifacts (e.g. "auth and dashboard")
  const hasMultipleDeliverables =
    /\band\b/i.test(d) &&
    !/\b(pins?|images?|photos?|links?|bullets?|notes?)\s+from\b/i.test(d) &&
    /\b(and\s+(the\s+)?[a-z]{3,})\b/i.test(d) &&
    !/\b(black and white|rock and roll|search and select|copy and paste)\b/i.test(d) &&
    d.split(/\s+/).length > 7;

  const one_output = !hasConjunctionOfDeliverables && !hasMultipleDeliverables;

  // Rule 2: showable
  // Names a concrete artifact, not a vague state like "work on", "progress", "stuff", "better", "improve"
  const isVague = VAGUE_WORDS.test(d);
  const showable = !isVague || concreteArtifacts.test(d);

  // Rule 3: countable
  // Has a number or explicit single edge ("1", "2", "3", "3 pins", "a list of", "rough draft")
  const countable =
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|single|first|rough draft|a |an )\b/i.test(
      d
    ) || concreteArtifacts.test(d);

  // Rule 4: fits_timer
  // Realistically finishable in the chosen minutes (15, 30, 45).
  // Picking 1-5 pins, drafting 3 bullets, choosing 3 references, writing 1 decision easily fits 15m!
  const isGiant = /\b(all|entire|whole|complete|full|every|everything|full app|all features)\b/i.test(
    d
  );
  const words = d.split(/\s+/).length;

  let fits_timer = !isGiant && words <= 16;
  if (isGiant) {
    fits_timer = false;
  } else if (mins === 15) {
    // Only fail 15m if requesting large counts of heavy deliverables (e.g. 10 screens, 20 pages)
    const heavyLargeCount =
      /\b([6-9]|\d{2,})\s+(screens|pages|flows|features|chapters|articles|components|wireframes)\b/i.test(
        d
      );
    if (heavyLargeCount) {
      fits_timer = false;
    }
  } else if (mins === 30) {
    const hugeCount = /\b(\d{2,})\s+(screens|pages|flows|features)\b/i.test(d);
    if (hugeCount) {
      fits_timer = false;
    }
  }

  let passedCount = 0;
  if (one_output) passedCount++;
  if (showable) passedCount++;
  if (countable) passedCount++;
  if (fits_timer) passedCount++;

  const score = Math.max(1, Math.min(4, passedCount)) as 1 | 2 | 3 | 4;

  let tip: string | undefined;
  if (score < 4) {
    if (!one_output) {
      tip = 'split bundled deliverables — pick just 1 for this block';
    } else if (!showable) {
      tip = 'vague state — name a thing you can screenshot (e.g. 3 pins, 1 draft, 3 bullets)';
    } else if (!countable) {
      tip = 'add a number or clear edge (e.g. "3 pins", "1 draft", "3 bullets")';
    } else if (!fits_timer) {
      tip = `too big for ${mins} mins — scale down to just the opening slice`;
    }
  }

  return {
    score,
    rules: { one_output, showable, countable, fits_timer },
    tip,
  };
}

export function scoreDone(d?: string): number {
  return gradeDoneState({ done: d }).score;
}

export function dots(n: number): string {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += i < n ? '●' : '○';
  }
  return s;
}

export function withArticle(o?: string): string {
  const obj = String(o || '').trim();
  if (!obj) return 'this';
  return /^(the|a|an|my|our|your|this|that|these|those|one|two|three|some|\d)/i.test(obj)
    ? obj
    : 'the ' + obj;
}

export function halve(done?: string): string {
  const map: Record<string, string> = {
    two: 'one',
    three: 'two',
    four: 'two',
    five: 'three',
    six: 'three',
    eight: 'four',
    ten: 'five',
  };
  const t = String(done || '').trim();
  const m = t.match(/\b(two|three|four|five|six|eight|ten)\b/i);
  if (m) {
    const key = m[0].toLowerCase();
    if (map[key]) return t.replace(m[0], map[key]);
  }
  const n = t.match(/\b(\d+)\b/);
  if (n && +n[1] > 1) {
    return t.replace(n[1], String(Math.ceil(+n[1] / 2)));
  }
  return 'just the first piece of ' + t;
}

/**
 * Clean up extra punctuation and words from a raw done or object input
 */
export function cleanArtifactName(text: string): string {
  return text
    .replace(/^\s*(\d+|one|two|three|a|an|the|my|our)\s+/i, '')
    .replace(
      /\b(work on|finish|improve|better|make progress on|the whole|everything about|clean up|build the)\b/gi,
      ''
    )
    .replace(/[.,;!?]+$/, '')
    .trim();
}

/**
 * Smartly sharpen a done state when user is ~50% partly done.
 * Decomposes user's specific wording into smaller, single-output, showable, countable options.
 */
export function partlySuggestions(b: Partial<Block>, avoid: string[] = []): Suggestion[] {
  const rawDone = b.done || 'what you were making';
  const rawObj = b.object || 'it';
  const mode = b.mode || 'creating';
  const cleanedDone = cleanArtifactName(rawDone);
  const cleanedObj = cleanArtifactName(rawObj);

  const suggestions: Suggestion[] = [];

  // 1. If user bundled multiple items with "and", ",", "+", split them
  if (/\b(and|\+|&)\b|,/i.test(rawDone)) {
    const parts = rawDone
      .split(/\band\b|,|\+|&/i)
      .map((p) => cleanArtifactName(p))
      .filter(Boolean);
    if (parts.length >= 2) {
      suggestions.push({
        mode,
        object: rawObj,
        done: `1 ${parts[0]}, rough draft`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: `split the bundled list: focus exclusively on ${parts[0]}`,
      });
      suggestions.push({
        mode,
        object: rawObj,
        done: `first slice of ${parts[1]}: 3 bullets`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: `tackle only the opening slice of ${parts[1]}`,
      });
    }
  }

  // 2. Count halving
  const halved = halve(rawDone);
  if (halved !== rawDone && !suggestions.some((s) => s.done === halved)) {
    suggestions.push({
      mode,
      object: rawObj,
      done: halved,
      mins: 15,
      rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
      rationale: 'cut the count in half so you finish cleanly in one sitting',
    });
  }

  // 3. Single concrete instance / rough draft of the object
  const singleDraft = `1 ${cleanedObj || cleanedDone}, rough draft`;
  if (!suggestions.some((s) => s.done.toLowerCase() === singleDraft.toLowerCase())) {
    suggestions.push({
      mode,
      object: rawObj,
      done: singleDraft,
      mins: 15,
      rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
      rationale: 'scope down to a single tangible rough draft',
    });
  }

  // 4. First piece only
  const firstPiece = `${cleanedDone.replace(/\.$/, '')} — only the first piece`;
  if (!suggestions.some((s) => s.done.toLowerCase() === firstPiece.toLowerCase())) {
    suggestions.push({
      mode,
      object: rawObj,
      done: firstPiece,
      mins: 30,
      rulesPassed: ['one output', 'you can show it', 'countable', 'fits 30 mins'],
      rationale: 'bound your target to just the initial section',
    });
  }

  // 5. 3 bullets summary / outline
  suggestions.push({
    mode,
    object: rawObj,
    done: `3 bullet points outlining ${cleanedDone}`,
    mins: 15,
    rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
    rationale: 'compress into 3 clear bullets before detailing',
  });

  // Filter out avoided
  const filtered = suggestions.filter((s) => !avoid.includes(s.done));
  return (filtered.length >= 3 ? filtered : suggestions).slice(0, 5);
}

/**
 * Smartly reframe when user achieved 0% (blocked / missed).
 * Switches mode to `defining` and unblocks with a tiny decision or list.
 */
export function missedSuggestions(b: Partial<Block>, avoid: string[] = []): Suggestion[] {
  const rawObj = b.object || b.done || 'this';
  const cleanObj = cleanArtifactName(rawObj);
  const targetName = cleanObj ? `the ${cleanObj}` : withArticle(rawObj);

  const suggestions: Suggestion[] = [
    {
      mode: 'defining',
      object: b.object || cleanObj,
      done: `a list of what ${targetName} actually needs`,
      mins: 15,
      rulesPassed: ['one output', 'a decision, written down', 'fits 15 mins'],
      rationale: 'write the requirements down before attempting to build',
    },
    {
      mode: 'defining',
      object: b.object || cleanObj,
      done: `1 decision written: where to start on ${targetName}`,
      mins: 15,
      rulesPassed: ['one output', 'a decision, written down', 'fits 15 mins'],
      rationale: 'commit to the single starting point in ink',
    },
    {
      mode: 'defining',
      object: b.object || cleanObj,
      done: `3 bullets on what ${targetName} means`,
      mins: 15,
      rulesPassed: ['one output', 'a decision, written down', 'fits 15 mins'],
      rationale: 'clarify the boundaries before diving back in',
    },
    {
      mode: 'defining',
      object: b.object || cleanObj,
      done: `1 sketch or outline of the first step for ${targetName}`,
      mins: 15,
      rulesPassed: ['one output', 'a decision, written down', 'fits 15 mins'],
      rationale: 'a rough sketch removes the hesitation of starting',
    },
    {
      mode: 'defining',
      object: b.object || cleanObj,
      done: `2 options compared for ${targetName}, 1 chosen`,
      mins: 30,
      rulesPassed: ['one output', 'a decision, written down', 'fits 30 mins'],
      rationale: 'weigh alternatives and pick one so you are unblocked',
    },
  ];

  const filtered = suggestions.filter((s) => !avoid.includes(s.done));
  return (filtered.length >= 3 ? filtered : suggestions).slice(0, 5);
}

/**
 * Smart starter suggestions when user has typed an object but needs help defining a sharp done state
 */
export function getSmartSimplificationsForInput(
  object: string,
  mode: Mode = 'creating',
  mins: Duration = 15
): Suggestion[] {
  const cleanObj = cleanArtifactName(object || 'this');
  const targetName = cleanObj ? `the ${cleanObj}` : 'this';

  // Specific domain intelligence: board / visual / research / design
  if (/\b(board|vision|mood|pinterest|inspo|inspiration|aesthetic)\b/i.test(object)) {
    if (mode === 'defining') {
      return [
        {
          mode: 'defining',
          object,
          done: `3 pins chosen from pinterest for ${targetName}`,
          mins: 15,
          rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
          rationale: '3 reference pins selected',
        },
        {
          mode: 'defining',
          object,
          done: `a list of 3 must-haves for ${targetName}`,
          mins: 15,
          rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
          rationale: '3 core visual constraints',
        },
        {
          mode: 'defining',
          object,
          done: `1 decision written: color palette and theme for ${targetName}`,
          mins: 15,
          rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
          rationale: 'concrete aesthetic direction',
        },
      ];
    }
  }

  if (mode === 'defining') {
    return [
      {
        mode: 'defining',
        object,
        done: `a list of 3 must-haves for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: '3 clear constraints',
      },
      {
        mode: 'defining',
        object,
        done: `1 decision written: the starting flow for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'single architectural choice',
      },
      {
        mode: 'defining',
        object,
        done: `3 bullet points defining scope for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'clear scope bounds',
      },
    ];
  }

  if (mode === 'critiquing') {
    return [
      {
        mode: 'critiquing',
        object,
        done: `3 bullet points of feedback on ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'bounded feedback notes',
      },
      {
        mode: 'critiquing',
        object,
        done: `1 prioritized list of 3 fixes for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'ranked punch list',
      },
    ];
  }

  if (mode === 'communicating') {
    return [
      {
        mode: 'communicating',
        object,
        done: `1 email draft sharing status of ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'single message drafted',
      },
      {
        mode: 'communicating',
        object,
        done: `2 bullet update written for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'concise team notes',
      },
    ];
  }

  if (mode === 'exploring') {
    return [
      {
        mode: 'exploring',
        object,
        done: `3 pins or links gathered for ${targetName}`,
        mins: 15,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
        rationale: 'concrete research bookmarks',
      },
      {
        mode: 'exploring',
        object,
        done: `1 summary note on how competitors handle ${targetName}`,
        mins: 30,
        rulesPassed: ['one output', 'you can show it', 'countable', 'fits 30 mins'],
        rationale: 'comparative benchmark note',
      },
    ];
  }

  // creating mode default
  return [
    {
      mode: 'creating',
      object,
      done: `1 rough draft of ${targetName}`,
      mins: 15,
      rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
      rationale: 'first working draft',
    },
    {
      mode: 'creating',
      object,
      done: `a list of 3 screens needed for ${targetName}`,
      mins: 15,
      rulesPassed: ['one output', 'you can show it', 'countable', 'fits 15 mins'],
      rationale: 'concrete inventory',
    },
    {
      mode: 'creating',
      object,
      done: `only the opening section of ${targetName}`,
      mins: mins,
      rulesPassed: ['one output', 'you can show it', 'countable', `fits ${mins} mins`],
      rationale: 'first slice only',
    },
  ];
}

export function formatTime(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}
