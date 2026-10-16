import React from 'react';

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueSuffix = '%',
  helperText,
  disabled = false,
  className = '',
  style = {},
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', ...style }} className={className}>
      {(label || value !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {label && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          <span
            className="mono"
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-sunken)',
              boxShadow: 'var(--shadow-sunken-sm)',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--primary)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            {value}{valueSuffix}
          </span>
        </div>
      )}

      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Sunken Background Track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: 'var(--bg-sunken)',
            boxShadow: 'var(--shadow-sunken-sm)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          {/* Active Gradient Fill */}
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              transition: 'width 0.1s ease-out',
            }}
          />
        </div>

        {/* Standard Range Input overlaid transparently for natural touch/drag ergonomics */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: 10,
            margin: 0,
          }}
        />

        {/* Custom Raised Tactile Thumb Visual */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 10px)`,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-raised-sm), 0 0 10px rgba(59, 130, 246, 0.6)',
            border: '3px solid #3b82f6',
            pointerEvents: 'none',
            transition: 'left 0.1s ease-out',
            zIndex: 5,
          }}
        />
      </div>

      {helperText && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
