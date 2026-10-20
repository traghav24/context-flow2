import React from 'react';
import { ASSETS } from '../constants';

export type MascotType =
  | 'grandma-head'
  | 'grandma-dog'
  | 'grandma-proud'
  | 'grandma-coach'
  | 'star-happy'
  | 'starburst-sad';

interface MascotProps {
  type: MascotType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export const Mascot: React.FC<MascotProps> = ({
  type,
  size = 64,
  className = '',
  style = {},
  alt = '',
}) => {
  // Use official assets with coherent styling
  if (type === 'grandma-head') {
    return (
      <img
        src={ASSETS.grandmaHead}
        alt={alt || 'a friendly grandma'}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '12px',
          border: '2.5px solid #000',
          objectFit: 'cover',
          background: '#fff',
          flexShrink: 0,
          boxShadow: '2px 2px 0 #000',
          ...style,
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (type === 'grandma-dog') {
    return (
      <img
        src={ASSETS.grandmaRead}
        alt={alt || 'grandma reading to her dog'}
        className={className}
        style={{
          width: `${size}px`,
          height: `${Math.round(size * 0.96)}px`,
          objectFit: 'contain',
          ...style,
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (type === 'star-happy') {
    return (
      <img
        src={ASSETS.star}
        alt={alt || 'happy star mascot'}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          ...style,
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (type === 'starburst-sad') {
    return (
      <img
        src={ASSETS.sad}
        alt={alt || 'sad starburst mascot'}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          ...style,
        }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // grandma-proud: grandma head with celebratory badge
  if (type === 'grandma-proud') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={ASSETS.grandmaHead}
          alt={alt || 'proud grandma'}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            border: '2.5px solid #000',
            objectFit: 'cover',
            background: '#fff',
            boxShadow: '2px 2px 0 #000',
          }}
          referrerPolicy="no-referrer"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: `${Math.round(size * 0.42)}px`,
            height: `${Math.round(size * 0.42)}px`,
            background: 'var(--yellow)',
            border: '2px solid #000',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.24)}px`,
            boxShadow: '1px 1px 0 #000',
          }}
          title="proud of you!"
        >
          ✦
        </div>
      </div>
    );
  }

  // grandma-coach: grandma with spectacles & coaching indicator
  if (type === 'grandma-coach') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={ASSETS.grandmaHead}
          alt={alt || 'grandma coach'}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            border: '2.5px solid #000',
            objectFit: 'cover',
            background: '#fff',
            boxShadow: '2px 2px 0 #000',
          }}
          referrerPolicy="no-referrer"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: `${Math.round(size * 0.42)}px`,
            height: `${Math.round(size * 0.42)}px`,
            background: 'var(--green)',
            border: '2px solid #000',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(size * 0.22)}px`,
            boxShadow: '1px 1px 0 #000',
          }}
          title="done-state coach"
        >
          💡
        </div>
      </div>
    );
  }

  return null;
};
