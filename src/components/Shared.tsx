import React from 'react';
import { ASSETS, TAG_ASSETS } from '../constants';
import { Mode, Duration } from '../types';

interface TagImgProps {
  tagKey: Mode | Duration;
  height?: number;
  className?: string;
}

export const TagImg: React.FC<TagImgProps> = ({ tagKey, height = 36, className = '' }) => {
  const src = TAG_ASSETS[tagKey] || '';
  const alt = typeof tagKey === 'number' || /^\d/.test(String(tagKey)) ? `${tagKey} mins` : tagKey;
  return (
    <img
      className={`tag ${className}`}
      src={src}
      alt={alt}
      style={{ height: `${height}px`, verticalAlign: 'middle', imageRendering: 'auto' }}
    />
  );
};

interface TagChipProps {
  tagKey: Mode | Duration;
  height?: number;
}

export const TagChip: React.FC<TagChipProps> = ({ tagKey, height = 30 }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        background: '#fff',
        borderRadius: '7px',
        padding: '3px 5px',
        verticalAlign: 'middle',
        lineHeight: 0,
      }}
    >
      <TagImg tagKey={tagKey} height={height} />
    </span>
  );
};

interface HeaderGrandmaProps {
  text: string;
}

export const HeaderGrandma: React.FC<HeaderGrandmaProps> = ({ text }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <img
        src={ASSETS.grandmaHead}
        alt="a friendly grandma"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '10px',
          border: '2px solid #000',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div className="bubble" style={{ marginTop: '8px' }}>
        {text}
      </div>
    </div>
  );
};

interface ArcLabelProps {
  id: string;
  text: string;
  d: string;
  width: number;
}

export const ArcLabel: React.FC<ArcLabelProps> = ({ id, text, d, width }) => {
  return (
    <svg
      className="starlabel"
      width={width}
      height="40"
      viewBox={`0 0 ${width} 40`}
      aria-hidden="true"
    >
      <defs>
        <path id={id} d={d} fill="none" />
      </defs>
      <text fontSize="21">
        <textPath href={`#${id}`} startOffset="2">
          {text}
        </textPath>
      </text>
    </svg>
  );
};
