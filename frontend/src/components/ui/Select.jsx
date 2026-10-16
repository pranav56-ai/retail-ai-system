import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  label,
  error,
  children,
  className = '',
  style = {},
  containerStyle = {},
  required = false,
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--accent-rose)', marginLeft: '3px' }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          backgroundColor: 'var(--bg-sunken)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sunken)',
          border: error ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <select
          id={selectId}
          style={{
            width: '100%',
            padding: '0.6rem 2.2rem 0.6rem 0.85rem',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            fontFamily: 'inherit',
            borderRadius: 'var(--radius-sm)',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            ...style,
          }}
          className={`neu-select ${className}`}
          {...props}
        >
          {children}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '0.75rem',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronDown size={15} />
        </div>
      </div>

      {error && (
        <span style={{ fontSize: '0.72rem', color: '#fda4af', marginTop: '1px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
