import { Mode, Duration } from './types';

export const MODES: Mode[] = ['defining', 'exploring', 'creating', 'critiquing', 'communicating'];

export const MINS: Duration[] = [15, 30, 45];

export const ASSETS = {
  grandmaHead: '/assets/grandma-book.png',
  grandmaRead: '/assets/grandma-dog.png',
  sad: '/assets/starburst-sad.png',
  star: '/assets/star-smiley.png',
};

export const TAG_ASSETS: Record<Mode | Duration, string> = {
  defining: '/assets/tags/tag-defining.png',
  exploring: '/assets/tags/tag-exploring.png',
  creating: '/assets/tags/tag-creating.png',
  critiquing: '/assets/tags/tag-critiquing.png',
  communicating: '/assets/tags/tag-communicating.png',
  15: '/assets/tags/tag-15.png',
  30: '/assets/tags/tag-30.png',
  45: '/assets/tags/tag-45.png',
};

export const STORAGE_KEY = 'contextflow.v2';
