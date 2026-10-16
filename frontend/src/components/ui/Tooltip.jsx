import React, { useState } from 'react';

/**
 * Robust, lightweight Hover Tooltip component
 * Wraps text naturally across 2-3 lines without abrupt single-line cuts,
 * and renders a high-contrast floating tooltip on hover showing the full unabbreviated title.
 */
export function TooltipText({
  text,
  badge,
  badgeColor = 'var(--primary)',
  subtext,
  className = '',
  style = {},
  textStyle = {},
  maxWidth = '100%',
  lines = 2,
  singleLine = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const clampClass = singleLine
    ? 'line-clamp-1'
    : lines === 1
    ? 'line-clamp-1'
    : lines === 2
    ? 'line-clamp-2'
    : lines === 3
    ? 'line-clamp-3'
    : '';

  return (
    <div
      className={`hover-tooltip-trigger ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        maxWidth: maxWidth,
        width: '100%',
        minWidth: 0,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={typeof text === 'string' ? text : undefined}
    >
      <div
        className={clampClass}
        style={{
          width: '100%',
          lineHeight: 1.35,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          ...textStyle,
        }}
      >
        {text}
      </div>

      {isHovered && text && (
        <div
          className="hover-tooltip-popup animate-in"
          style={{
            pointerEvents: 'none',
          }}
        >
          {badge && (
            <div
              style={{
                color: badgeColor,
                fontSize: '0.66rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: badgeColor,
                }}
              />
              {badge}
            </div>
          )}
          <div
            style={{
              fontWeight: 800,
              color: 'inherit',
              fontSize: '0.84rem',
              lineHeight: 1.35,
              wordBreak: 'break-word',
            }}
          >
            {text}
          </div>
          {subtext && (
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                marginTop: '5px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '4px',
                lineHeight: 1.35,
              }}
            >
              {subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

