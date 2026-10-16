import React from 'react';

export function Input({
  label,
  error,
  icon: Icon,
  iconRight: IconRight,
  onIconRightClick,
  className = '',
  style = {},
  containerStyle = {},
  required = false,
  helperText,
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...containerStyle }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {label}
            {required && <span style={{ color: 'var(--accent-rose)', marginLeft: '3px' }}>*</span>}
          </span>
          {helperText && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{helperText}</span>}
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
          transition: 'all var(--transition-fast)',
        }}
      >
        {Icon && (
          <div
            style={{
              paddingLeft: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          style={{
            width: '100%',
            padding: Icon ? '0.6rem 0.75rem 0.6rem 0.5rem' : '0.6rem 0.85rem',
            paddingRight: IconRight ? '2.4rem' : '0.85rem',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            fontFamily: 'inherit',
            borderRadius: 'var(--radius-sm)',
            ...style,
          }}
          className={`neu-input ${className}`}
          {...props}
        />

        {IconRight && (
          <div
            onClick={onIconRightClick}
            style={{
              position: 'absolute',
              right: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: onIconRightClick ? 'pointer' : 'default',
            }}
          >
            <IconRight size={16} />
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.72rem', color: '#fda4af', marginTop: '1px' }}>
          {error}
        </span>
      )}
    </div>
  );
}
